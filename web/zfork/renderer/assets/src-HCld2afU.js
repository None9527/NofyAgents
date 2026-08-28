var e = `zh-CN`;
function t(e) {
  if (e.kind === `ssh`) {
    let { password: t, privateKeyPassphrase: n, ...r } = e;
    return r;
  }
  if (e.kind === `server`) {
    let { token: t, ...n } = e;
    return n;
  }
  return e;
}
function n(e) {
  let t = e.match(/^([A-Z]:)\/(.*)$/);
  if (t) return { prefix: `${t[1]}/`, body: t[2] ?? ``, blocksParentTraversal: !0 };
  if (e.startsWith(`//`)) {
    let t = e.slice(2).split(`/`).filter(Boolean);
    if (t.length >= 2) {
      let [e, n, ...r] = t;
      return { prefix: `//${e}/${n}/`, body: r.join(`/`), blocksParentTraversal: !0 };
    }
    return { prefix: `//`, body: t.join(`/`), blocksParentTraversal: !0 };
  }
  if (e.startsWith(`/`))
    return { prefix: `/`, body: e.replace(/^\/+/, ``), blocksParentTraversal: !0 };
  if (e.startsWith(`~/`)) return { prefix: `~/`, body: e.slice(2), blocksParentTraversal: !1 };
  let n = e.match(/^([A-Z]:)(.*)$/);
  return n
    ? { prefix: n[1] ?? ``, body: n[2] ?? ``, blocksParentTraversal: !1 }
    : { prefix: ``, body: e, blocksParentTraversal: !1 };
}
function r(e) {
  let t = e?.trim();
  if (!t) return ``;
  let r = n(t.replace(/\\/g, `/`).replace(/^([a-z]):/i, (e, t) => `${t.toUpperCase()}:`)),
    i = [];
  for (let e of r.body.split(`/`))
    if (!(!e || e === `.`)) {
      if (e === `..`) {
        if (i.length > 0 && i.at(-1) !== `..`) {
          i.pop();
          continue;
        }
        if (r.blocksParentTraversal) continue;
        i.push(e);
        continue;
      }
      i.push(e);
    }
  return `${r.prefix}${i.join(`/`)}` || r.prefix;
}
function i(e) {
  return e.privateKeyPath?.trim()
    ? `private-key`
    : (`password` in e && typeof e.password == `string`) ||
        (`passwordCredentialKey` in e && e.passwordCredentialKey?.trim())
      ? `password`
      : `agent`;
}
function a(e) {
  return JSON.stringify([
    `ssh:v1`,
    e.host.trim().toLowerCase(),
    e.port ?? 22,
    e.username.trim(),
    i(e),
    r(e.privateKeyPath),
  ]);
}
function o(e) {
  return e?.trim().toLowerCase() === `production` ? `production` : `test`;
}
var s = o(`production`);
typeof process < `u` && {}.ZCODE_DEBUG;
function c(e) {
  return typeof e == `object` && !!e;
}
function l(e) {
  if (typeof e == `string` || typeof e == `number` || typeof e == `bigint`) return String(e);
}
function u(e) {
  return !c(e) || !(`error` in e) || !c(e.error)
    ? e
    : `message` in e.error || `code` in e.error
      ? e.error
      : e;
}
var d = `ZCODE_FILE_LOCK_TIMEOUT`;
function f(e) {
  if (typeof e == `string`) return e;
  if (e === null) return `null`;
  if (e === void 0) return `undefined`;
  if (typeof e == `number` || typeof e == `boolean` || typeof e == `bigint`) return String(e);
  try {
    let t = JSON.stringify(e);
    if (t !== void 0) return t;
  } catch {}
  return String(e);
}
function ee(e) {
  let t = u(e);
  if (t instanceof Error) {
    let e = t;
    return { message: t.message || t.name || String(t), code: l(e.code) };
  }
  if (c(t)) {
    let e = `code` in t ? l(t.code) : void 0,
      n = `message` in t ? f(t.message) : f(t);
    return { message: n !== `undefined` && n.length > 0 ? n : f(t), code: e };
  }
  return { message: f(t) };
}
function te(e) {
  return ee(e).code === d;
}
Object.freeze({ status: `aborted` });
function p(e, t, n) {
  function r(n, r) {
    if (
      (n._zod ||
        Object.defineProperty(n, `_zod`, {
          value: { def: r, constr: o, traits: new Set() },
          enumerable: !1,
        }),
      n._zod.traits.has(e))
    )
      return;
    (n._zod.traits.add(e), t(n, r));
    let i = o.prototype,
      a = Object.keys(i);
    for (let e = 0; e < a.length; e++) {
      let t = a[e];
      t in n || (n[t] = i[t].bind(n));
    }
  }
  let i = n?.Parent ?? Object;
  class a extends i {}
  Object.defineProperty(a, `name`, { value: e });
  function o(e) {
    var t;
    let i = n?.Parent ? new a() : this;
    (r(i, e), (t = i._zod).deferred ?? (t.deferred = []));
    for (let e of i._zod.deferred) e();
    return i;
  }
  return (
    Object.defineProperty(o, `init`, { value: r }),
    Object.defineProperty(o, Symbol.hasInstance, {
      value: (t) => (n?.Parent && t instanceof n.Parent ? !0 : t?._zod?.traits?.has(e)),
    }),
    Object.defineProperty(o, `name`, { value: e }),
    o
  );
}
var ne = class extends Error {
    constructor() {
      super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
    }
  },
  re = class extends Error {
    constructor(e) {
      (super(`Encountered unidirectional transform during encode: ${e}`),
        (this.name = `ZodEncodeError`));
    }
  },
  ie = {};
function ae(e) {
  return (e && Object.assign(ie, e), ie);
}
function oe(e) {
  let t = Object.values(e).filter((e) => typeof e == `number`);
  return Object.entries(e)
    .filter(([e, n]) => t.indexOf(+e) === -1)
    .map(([e, t]) => t);
}
function se(e, t) {
  return typeof t == `bigint` ? t.toString() : t;
}
function ce(e) {
  return {
    get value() {
      {
        let t = e();
        return (Object.defineProperty(this, `value`, { value: t }), t);
      }
      throw Error(`cached value already set`);
    },
  };
}
function le(e) {
  return e == null;
}
function ue(e) {
  let t = +!!e.startsWith(`^`),
    n = e.endsWith(`$`) ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function de(e, t) {
  let n = (e.toString().split(`.`)[1] || ``).length,
    r = t.toString(),
    i = (r.split(`.`)[1] || ``).length;
  if (i === 0 && /\d?e-\d?/.test(r)) {
    let e = r.match(/\d?e-(\d?)/);
    e?.[1] && (i = Number.parseInt(e[1]));
  }
  let a = n > i ? n : i;
  return (
    (Number.parseInt(e.toFixed(a).replace(`.`, ``)) %
      Number.parseInt(t.toFixed(a).replace(`.`, ``))) /
    10 ** a
  );
}
var fe = Symbol(`evaluating`);
function m(e, t, n) {
  let r;
  Object.defineProperty(e, t, {
    get() {
      if (r !== fe) return (r === void 0 && ((r = fe), (r = n())), r);
    },
    set(n) {
      Object.defineProperty(e, t, { value: n });
    },
    configurable: !0,
  });
}
function pe(e, t, n) {
  Object.defineProperty(e, t, { value: n, writable: !0, enumerable: !0, configurable: !0 });
}
function me(...e) {
  let t = {};
  for (let n of e) Object.assign(t, Object.getOwnPropertyDescriptors(n));
  return Object.defineProperties({}, t);
}
function he(e) {
  return JSON.stringify(e);
}
function ge(e) {
  return e
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, ``)
    .replace(/[\s_-]+/g, `-`)
    .replace(/^-+|-+$/g, ``);
}
var _e = `captureStackTrace` in Error ? Error.captureStackTrace : (...e) => {};
function ve(e) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
var ye = ce(() => {
  if (typeof navigator < `u` && navigator?.userAgent?.includes(`Cloudflare`)) return !1;
  try {
    return (Function(``), !0);
  } catch {
    return !1;
  }
});
function be(e) {
  if (ve(e) === !1) return !1;
  let t = e.constructor;
  if (t === void 0 || typeof t != `function`) return !0;
  let n = t.prototype;
  return !(ve(n) === !1 || Object.prototype.hasOwnProperty.call(n, `isPrototypeOf`) === !1);
}
function xe(e) {
  return be(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
var Se = new Set([`string`, `number`, `symbol`]);
function Ce(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}
function h(e, t, n) {
  let r = new e._zod.constr(t ?? e._zod.def);
  return ((!t || n?.parent) && (r._zod.parent = e), r);
}
function g(e) {
  let t = e;
  if (!t) return {};
  if (typeof t == `string`) return { error: () => t };
  if (t?.message !== void 0) {
    if (t?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return (delete t.message, typeof t.error == `string` ? { ...t, error: () => t.error } : t);
}
function we(e) {
  return Object.keys(e).filter(
    (t) => e[t]._zod.optin === `optional` && e[t]._zod.optout === `optional`,
  );
}
var Te = {
  safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
};
function Ee(e, t) {
  let n = e._zod.def,
    r = n.checks;
  if (r && r.length > 0)
    throw Error(`.pick() cannot be used on object schemas containing refinements`);
  return h(
    e,
    me(e._zod.def, {
      get shape() {
        let e = {};
        for (let r in t) {
          if (!(r in n.shape)) throw Error(`Unrecognized key: "${r}"`);
          t[r] && (e[r] = n.shape[r]);
        }
        return (pe(this, `shape`, e), e);
      },
      checks: [],
    }),
  );
}
function De(e, t) {
  let n = e._zod.def,
    r = n.checks;
  if (r && r.length > 0)
    throw Error(`.omit() cannot be used on object schemas containing refinements`);
  return h(
    e,
    me(e._zod.def, {
      get shape() {
        let r = { ...e._zod.def.shape };
        for (let e in t) {
          if (!(e in n.shape)) throw Error(`Unrecognized key: "${e}"`);
          t[e] && delete r[e];
        }
        return (pe(this, `shape`, r), r);
      },
      checks: [],
    }),
  );
}
function Oe(e, t) {
  if (!be(t)) throw Error(`Invalid input to extend: expected a plain object`);
  let n = e._zod.def.checks;
  if (n && n.length > 0) {
    let n = e._zod.def.shape;
    for (let e in t)
      if (Object.getOwnPropertyDescriptor(n, e) !== void 0)
        throw Error(
          "Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.",
        );
  }
  return h(
    e,
    me(e._zod.def, {
      get shape() {
        let n = { ...e._zod.def.shape, ...t };
        return (pe(this, `shape`, n), n);
      },
    }),
  );
}
function ke(e, t) {
  if (!be(t)) throw Error(`Invalid input to safeExtend: expected a plain object`);
  return h(
    e,
    me(e._zod.def, {
      get shape() {
        let n = { ...e._zod.def.shape, ...t };
        return (pe(this, `shape`, n), n);
      },
    }),
  );
}
function Ae(e, t) {
  return h(
    e,
    me(e._zod.def, {
      get shape() {
        let n = { ...e._zod.def.shape, ...t._zod.def.shape };
        return (pe(this, `shape`, n), n);
      },
      get catchall() {
        return t._zod.def.catchall;
      },
      checks: [],
    }),
  );
}
function je(e, t, n) {
  let r = t._zod.def.checks;
  if (r && r.length > 0)
    throw Error(`.partial() cannot be used on object schemas containing refinements`);
  return h(
    t,
    me(t._zod.def, {
      get shape() {
        let r = t._zod.def.shape,
          i = { ...r };
        if (n)
          for (let t in n) {
            if (!(t in r)) throw Error(`Unrecognized key: "${t}"`);
            n[t] && (i[t] = e ? new e({ type: `optional`, innerType: r[t] }) : r[t]);
          }
        else for (let t in r) i[t] = e ? new e({ type: `optional`, innerType: r[t] }) : r[t];
        return (pe(this, `shape`, i), i);
      },
      checks: [],
    }),
  );
}
function Me(e, t, n) {
  return h(
    t,
    me(t._zod.def, {
      get shape() {
        let r = t._zod.def.shape,
          i = { ...r };
        if (n)
          for (let t in n) {
            if (!(t in i)) throw Error(`Unrecognized key: "${t}"`);
            n[t] && (i[t] = new e({ type: `nonoptional`, innerType: r[t] }));
          }
        else for (let t in r) i[t] = new e({ type: `nonoptional`, innerType: r[t] });
        return (pe(this, `shape`, i), i);
      },
    }),
  );
}
function Ne(e, t = 0) {
  if (e.aborted === !0) return !0;
  for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
  return !1;
}
function Pe(e, t) {
  return t.map((t) => {
    var n;
    return ((n = t).path ?? (n.path = []), t.path.unshift(e), t);
  });
}
function Fe(e) {
  return typeof e == `string` ? e : e?.message;
}
function Ie(e, t, n) {
  let r = { ...e, path: e.path ?? [] };
  return (
    e.message ||
      (r.message =
        Fe(e.inst?._zod.def?.error?.(e)) ??
        Fe(t?.error?.(e)) ??
        Fe(n.customError?.(e)) ??
        Fe(n.localeError?.(e)) ??
        `Invalid input`),
    delete r.inst,
    delete r.continue,
    t?.reportInput || delete r.input,
    r
  );
}
function Le(e) {
  return Array.isArray(e) ? `array` : typeof e == `string` ? `string` : `unknown`;
}
function Re(...e) {
  let [t, n, r] = e;
  return typeof t == `string` ? { message: t, code: `custom`, input: n, inst: r } : { ...t };
}
var ze = (e, t) => {
    ((e.name = `$ZodError`),
      Object.defineProperty(e, `_zod`, { value: e._zod, enumerable: !1 }),
      Object.defineProperty(e, `issues`, { value: t, enumerable: !1 }),
      (e.message = JSON.stringify(t, se, 2)),
      Object.defineProperty(e, `toString`, { value: () => e.message, enumerable: !1 }));
  },
  Be = p(`$ZodError`, ze),
  Ve = p(`$ZodError`, ze, { Parent: Error });
function He(e, t = (e) => e.message) {
  let n = {},
    r = [];
  for (let i of e.issues)
    i.path.length > 0
      ? ((n[i.path[0]] = n[i.path[0]] || []), n[i.path[0]].push(t(i)))
      : r.push(t(i));
  return { formErrors: r, fieldErrors: n };
}
function Ue(e, t = (e) => e.message) {
  let n = { _errors: [] },
    r = (e) => {
      for (let i of e.issues)
        if (i.code === `invalid_union` && i.errors.length) i.errors.map((e) => r({ issues: e }));
        else if (i.code === `invalid_key`) r({ issues: i.issues });
        else if (i.code === `invalid_element`) r({ issues: i.issues });
        else if (i.path.length === 0) n._errors.push(t(i));
        else {
          let e = n,
            r = 0;
          for (; r < i.path.length;) {
            let n = i.path[r];
            (r === i.path.length - 1
              ? ((e[n] = e[n] || { _errors: [] }), e[n]._errors.push(t(i)))
              : (e[n] = e[n] || { _errors: [] }),
              (e = e[n]),
              r++);
          }
        }
    };
  return (r(e), n);
}
var We = (e) => (t, n, r, i) => {
    let a = r ? Object.assign(r, { async: !1 }) : { async: !1 },
      o = t._zod.run({ value: n, issues: [] }, a);
    if (o instanceof Promise) throw new ne();
    if (o.issues.length) {
      let t = new (i?.Err ?? e)(o.issues.map((e) => Ie(e, a, ae())));
      throw (_e(t, i?.callee), t);
    }
    return o.value;
  },
  Ge = (e) => async (t, n, r, i) => {
    let a = r ? Object.assign(r, { async: !0 }) : { async: !0 },
      o = t._zod.run({ value: n, issues: [] }, a);
    if ((o instanceof Promise && (o = await o), o.issues.length)) {
      let t = new (i?.Err ?? e)(o.issues.map((e) => Ie(e, a, ae())));
      throw (_e(t, i?.callee), t);
    }
    return o.value;
  },
  Ke = (e) => (t, n, r) => {
    let i = r ? { ...r, async: !1 } : { async: !1 },
      a = t._zod.run({ value: n, issues: [] }, i);
    if (a instanceof Promise) throw new ne();
    return a.issues.length
      ? { success: !1, error: new (e ?? Be)(a.issues.map((e) => Ie(e, i, ae()))) }
      : { success: !0, data: a.value };
  },
  qe = Ke(Ve),
  Je = (e) => async (t, n, r) => {
    let i = r ? Object.assign(r, { async: !0 }) : { async: !0 },
      a = t._zod.run({ value: n, issues: [] }, i);
    return (
      a instanceof Promise && (a = await a),
      a.issues.length
        ? { success: !1, error: new e(a.issues.map((e) => Ie(e, i, ae()))) }
        : { success: !0, data: a.value }
    );
  },
  Ye = Je(Ve),
  Xe = (e) => (t, n, r) => {
    let i = r ? Object.assign(r, { direction: `backward` }) : { direction: `backward` };
    return We(e)(t, n, i);
  },
  Ze = (e) => (t, n, r) => We(e)(t, n, r),
  Qe = (e) => async (t, n, r) => {
    let i = r ? Object.assign(r, { direction: `backward` }) : { direction: `backward` };
    return Ge(e)(t, n, i);
  },
  $e = (e) => async (t, n, r) => Ge(e)(t, n, r),
  et = (e) => (t, n, r) => {
    let i = r ? Object.assign(r, { direction: `backward` }) : { direction: `backward` };
    return Ke(e)(t, n, i);
  },
  tt = (e) => (t, n, r) => Ke(e)(t, n, r),
  nt = (e) => async (t, n, r) => {
    let i = r ? Object.assign(r, { direction: `backward` }) : { direction: `backward` };
    return Je(e)(t, n, i);
  },
  rt = (e) => async (t, n, r) => Je(e)(t, n, r),
  it = /^[cC][^\s-]{8,}$/,
  at = /^[0-9a-z]+$/,
  ot = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,
  st = /^[0-9a-vA-V]{20}$/,
  ct = /^[A-Za-z0-9]{27}$/,
  lt = /^[a-zA-Z0-9_-]{21}$/,
  ut =
    /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
  dt = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  ft = (e) =>
    e
      ? RegExp(
          `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`,
        )
      : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,
  pt =
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
  mt = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function ht() {
  return new RegExp(mt, `u`);
}
var gt =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  _t =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,
  vt =
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
  yt =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  bt = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
  xt = /^[A-Za-z0-9_-]*$/,
  St = /^\+[1-9]\d{6,14}$/,
  Ct = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`,
  wt = RegExp(`^${Ct}$`);
function Tt(e) {
  let t = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  return typeof e.precision == `number`
    ? e.precision === -1
      ? `${t}`
      : e.precision === 0
        ? `${t}:[0-5]\\d`
        : `${t}:[0-5]\\d\\.\\d{${e.precision}}`
    : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Et(e) {
  return RegExp(`^${Tt(e)}$`);
}
function Dt(e) {
  let t = Tt({ precision: e.precision }),
    n = [`Z`];
  (e.local && n.push(``), e.offset && n.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`));
  let r = `${t}(?:${n.join(`|`)})`;
  return RegExp(`^${Ct}T(?:${r})$`);
}
var Ot = (e) => {
    let t = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ``}}` : `[\\s\\S]*`;
    return RegExp(`^${t}$`);
  },
  kt = /^-?\d+$/,
  At = /^-?\d+(?:\.\d+)?$/,
  jt = /^(?:true|false)$/i,
  Mt = /^undefined$/i,
  Nt = /^[^A-Z]*$/,
  Pt = /^[^a-z]*$/,
  _ = p(`$ZodCheck`, (e, t) => {
    var n;
    ((e._zod ??= {}), (e._zod.def = t), (n = e._zod).onattach ?? (n.onattach = []));
  }),
  Ft = { number: `number`, bigint: `bigint`, object: `date` },
  It = p(`$ZodCheckLessThan`, (e, t) => {
    _.init(e, t);
    let n = Ft[typeof t.value];
    (e._zod.onattach.push((e) => {
      let n = e._zod.bag,
        r = (t.inclusive ? n.maximum : n.exclusiveMaximum) ?? 1 / 0;
      t.value < r && (t.inclusive ? (n.maximum = t.value) : (n.exclusiveMaximum = t.value));
    }),
      (e._zod.check = (r) => {
        (t.inclusive ? r.value <= t.value : r.value < t.value) ||
          r.issues.push({
            origin: n,
            code: `too_big`,
            maximum: typeof t.value == `object` ? t.value.getTime() : t.value,
            input: r.value,
            inclusive: t.inclusive,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Lt = p(`$ZodCheckGreaterThan`, (e, t) => {
    _.init(e, t);
    let n = Ft[typeof t.value];
    (e._zod.onattach.push((e) => {
      let n = e._zod.bag,
        r = (t.inclusive ? n.minimum : n.exclusiveMinimum) ?? -1 / 0;
      t.value > r && (t.inclusive ? (n.minimum = t.value) : (n.exclusiveMinimum = t.value));
    }),
      (e._zod.check = (r) => {
        (t.inclusive ? r.value >= t.value : r.value > t.value) ||
          r.issues.push({
            origin: n,
            code: `too_small`,
            minimum: typeof t.value == `object` ? t.value.getTime() : t.value,
            input: r.value,
            inclusive: t.inclusive,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Rt = p(`$ZodCheckMultipleOf`, (e, t) => {
    (_.init(e, t),
      e._zod.onattach.push((e) => {
        var n;
        (n = e._zod.bag).multipleOf ?? (n.multipleOf = t.value);
      }),
      (e._zod.check = (n) => {
        if (typeof n.value != typeof t.value)
          throw Error(`Cannot mix number and bigint in multiple_of check.`);
        (typeof n.value == `bigint`
          ? n.value % t.value === BigInt(0)
          : de(n.value, t.value) === 0) ||
          n.issues.push({
            origin: typeof n.value,
            code: `not_multiple_of`,
            divisor: t.value,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  zt = p(`$ZodCheckNumberFormat`, (e, t) => {
    (_.init(e, t), (t.format = t.format || `float64`));
    let n = t.format?.includes(`int`),
      r = n ? `int` : `number`,
      [i, a] = Te[t.format];
    (e._zod.onattach.push((e) => {
      let r = e._zod.bag;
      ((r.format = t.format), (r.minimum = i), (r.maximum = a), n && (r.pattern = kt));
    }),
      (e._zod.check = (o) => {
        let s = o.value;
        if (n) {
          if (!Number.isInteger(s)) {
            o.issues.push({
              expected: r,
              format: t.format,
              code: `invalid_type`,
              continue: !1,
              input: s,
              inst: e,
            });
            return;
          }
          if (!Number.isSafeInteger(s)) {
            s > 0
              ? o.issues.push({
                  input: s,
                  code: `too_big`,
                  maximum: 2 ** 53 - 1,
                  note: `Integers must be within the safe integer range.`,
                  inst: e,
                  origin: r,
                  inclusive: !0,
                  continue: !t.abort,
                })
              : o.issues.push({
                  input: s,
                  code: `too_small`,
                  minimum: -(2 ** 53 - 1),
                  note: `Integers must be within the safe integer range.`,
                  inst: e,
                  origin: r,
                  inclusive: !0,
                  continue: !t.abort,
                });
            return;
          }
        }
        (s < i &&
          o.issues.push({
            origin: `number`,
            input: s,
            code: `too_small`,
            minimum: i,
            inclusive: !0,
            inst: e,
            continue: !t.abort,
          }),
          s > a &&
            o.issues.push({
              origin: `number`,
              input: s,
              code: `too_big`,
              maximum: a,
              inclusive: !0,
              inst: e,
              continue: !t.abort,
            }));
      }));
  }),
  Bt = p(`$ZodCheckMaxLength`, (e, t) => {
    var n;
    (_.init(e, t),
      (n = e._zod.def).when ??
        (n.when = (e) => {
          let t = e.value;
          return !le(t) && t.length !== void 0;
        }),
      e._zod.onattach.push((e) => {
        let n = e._zod.bag.maximum ?? 1 / 0;
        t.maximum < n && (e._zod.bag.maximum = t.maximum);
      }),
      (e._zod.check = (n) => {
        let r = n.value;
        if (r.length <= t.maximum) return;
        let i = Le(r);
        n.issues.push({
          origin: i,
          code: `too_big`,
          maximum: t.maximum,
          inclusive: !0,
          input: r,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  Vt = p(`$ZodCheckMinLength`, (e, t) => {
    var n;
    (_.init(e, t),
      (n = e._zod.def).when ??
        (n.when = (e) => {
          let t = e.value;
          return !le(t) && t.length !== void 0;
        }),
      e._zod.onattach.push((e) => {
        let n = e._zod.bag.minimum ?? -1 / 0;
        t.minimum > n && (e._zod.bag.minimum = t.minimum);
      }),
      (e._zod.check = (n) => {
        let r = n.value;
        if (r.length >= t.minimum) return;
        let i = Le(r);
        n.issues.push({
          origin: i,
          code: `too_small`,
          minimum: t.minimum,
          inclusive: !0,
          input: r,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  Ht = p(`$ZodCheckLengthEquals`, (e, t) => {
    var n;
    (_.init(e, t),
      (n = e._zod.def).when ??
        (n.when = (e) => {
          let t = e.value;
          return !le(t) && t.length !== void 0;
        }),
      e._zod.onattach.push((e) => {
        let n = e._zod.bag;
        ((n.minimum = t.length), (n.maximum = t.length), (n.length = t.length));
      }),
      (e._zod.check = (n) => {
        let r = n.value,
          i = r.length;
        if (i === t.length) return;
        let a = Le(r),
          o = i > t.length;
        n.issues.push({
          origin: a,
          ...(o
            ? { code: `too_big`, maximum: t.length }
            : { code: `too_small`, minimum: t.length }),
          inclusive: !0,
          exact: !0,
          input: n.value,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  Ut = p(`$ZodCheckStringFormat`, (e, t) => {
    var n, r;
    (_.init(e, t),
      e._zod.onattach.push((e) => {
        let n = e._zod.bag;
        ((n.format = t.format),
          t.pattern && ((n.patterns ??= new Set()), n.patterns.add(t.pattern)));
      }),
      t.pattern
        ? ((n = e._zod).check ??
          (n.check = (n) => {
            ((t.pattern.lastIndex = 0),
              !t.pattern.test(n.value) &&
                n.issues.push({
                  origin: `string`,
                  code: `invalid_format`,
                  format: t.format,
                  input: n.value,
                  ...(t.pattern ? { pattern: t.pattern.toString() } : {}),
                  inst: e,
                  continue: !t.abort,
                }));
          }))
        : ((r = e._zod).check ?? (r.check = () => {})));
  }),
  Wt = p(`$ZodCheckRegex`, (e, t) => {
    (Ut.init(e, t),
      (e._zod.check = (n) => {
        ((t.pattern.lastIndex = 0),
          !t.pattern.test(n.value) &&
            n.issues.push({
              origin: `string`,
              code: `invalid_format`,
              format: `regex`,
              input: n.value,
              pattern: t.pattern.toString(),
              inst: e,
              continue: !t.abort,
            }));
      }));
  }),
  Gt = p(`$ZodCheckLowerCase`, (e, t) => {
    ((t.pattern ??= Nt), Ut.init(e, t));
  }),
  Kt = p(`$ZodCheckUpperCase`, (e, t) => {
    ((t.pattern ??= Pt), Ut.init(e, t));
  }),
  qt = p(`$ZodCheckIncludes`, (e, t) => {
    _.init(e, t);
    let n = Ce(t.includes),
      r = new RegExp(typeof t.position == `number` ? `^.{${t.position}}${n}` : n);
    ((t.pattern = r),
      e._zod.onattach.push((e) => {
        let t = e._zod.bag;
        ((t.patterns ??= new Set()), t.patterns.add(r));
      }),
      (e._zod.check = (n) => {
        n.value.includes(t.includes, t.position) ||
          n.issues.push({
            origin: `string`,
            code: `invalid_format`,
            format: `includes`,
            includes: t.includes,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Jt = p(`$ZodCheckStartsWith`, (e, t) => {
    _.init(e, t);
    let n = RegExp(`^${Ce(t.prefix)}.*`);
    ((t.pattern ??= n),
      e._zod.onattach.push((e) => {
        let t = e._zod.bag;
        ((t.patterns ??= new Set()), t.patterns.add(n));
      }),
      (e._zod.check = (n) => {
        n.value.startsWith(t.prefix) ||
          n.issues.push({
            origin: `string`,
            code: `invalid_format`,
            format: `starts_with`,
            prefix: t.prefix,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Yt = p(`$ZodCheckEndsWith`, (e, t) => {
    _.init(e, t);
    let n = RegExp(`.*${Ce(t.suffix)}$`);
    ((t.pattern ??= n),
      e._zod.onattach.push((e) => {
        let t = e._zod.bag;
        ((t.patterns ??= new Set()), t.patterns.add(n));
      }),
      (e._zod.check = (n) => {
        n.value.endsWith(t.suffix) ||
          n.issues.push({
            origin: `string`,
            code: `invalid_format`,
            format: `ends_with`,
            suffix: t.suffix,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Xt = p(`$ZodCheckOverwrite`, (e, t) => {
    (_.init(e, t),
      (e._zod.check = (e) => {
        e.value = t.tx(e.value);
      }));
  }),
  Zt = class {
    constructor(e = []) {
      ((this.content = []), (this.indent = 0), this && (this.args = e));
    }
    indented(e) {
      ((this.indent += 1), e(this), --this.indent);
    }
    write(e) {
      if (typeof e == `function`) {
        (e(this, { execution: `sync` }), e(this, { execution: `async` }));
        return;
      }
      let t = e
          .split(
            `
`,
          )
          .filter((e) => e),
        n = Math.min(...t.map((e) => e.length - e.trimStart().length)),
        r = t.map((e) => e.slice(n)).map((e) => ` `.repeat(this.indent * 2) + e);
      for (let e of r) this.content.push(e);
    }
    compile() {
      let e = Function,
        t = this?.args,
        n = [...(this?.content ?? [``]).map((e) => `  ${e}`)];
      return new e(
        ...t,
        n.join(`
`),
      );
    }
  },
  Qt = { major: 4, minor: 3, patch: 6 },
  v = p(`$ZodType`, (e, t) => {
    var n;
    ((e ??= {}), (e._zod.def = t), (e._zod.bag = e._zod.bag || {}), (e._zod.version = Qt));
    let r = [...(e._zod.def.checks ?? [])];
    e._zod.traits.has(`$ZodCheck`) && r.unshift(e);
    for (let t of r) for (let n of t._zod.onattach) n(e);
    if (r.length === 0)
      ((n = e._zod).deferred ?? (n.deferred = []),
        e._zod.deferred?.push(() => {
          e._zod.run = e._zod.parse;
        }));
    else {
      let t = (e, t, n) => {
          let r = Ne(e),
            i;
          for (let a of t) {
            if (a._zod.def.when) {
              if (!a._zod.def.when(e)) continue;
            } else if (r) continue;
            let t = e.issues.length,
              o = a._zod.check(e);
            if (o instanceof Promise && n?.async === !1) throw new ne();
            if (i || o instanceof Promise)
              i = (i ?? Promise.resolve()).then(async () => {
                (await o, e.issues.length !== t && (r ||= Ne(e, t)));
              });
            else {
              if (e.issues.length === t) continue;
              r ||= Ne(e, t);
            }
          }
          return i ? i.then(() => e) : e;
        },
        n = (n, i, a) => {
          if (Ne(n)) return ((n.aborted = !0), n);
          let o = t(i, r, a);
          if (o instanceof Promise) {
            if (a.async === !1) throw new ne();
            return o.then((t) => e._zod.parse(t, a));
          }
          return e._zod.parse(o, a);
        };
      e._zod.run = (i, a) => {
        if (a.skipChecks) return e._zod.parse(i, a);
        if (a.direction === `backward`) {
          let t = e._zod.parse({ value: i.value, issues: [] }, { ...a, skipChecks: !0 });
          return t instanceof Promise ? t.then((e) => n(e, i, a)) : n(t, i, a);
        }
        let o = e._zod.parse(i, a);
        if (o instanceof Promise) {
          if (a.async === !1) throw new ne();
          return o.then((e) => t(e, r, a));
        }
        return t(o, r, a);
      };
    }
    m(e, `~standard`, () => ({
      validate: (t) => {
        try {
          let n = qe(e, t);
          return n.success ? { value: n.data } : { issues: n.error?.issues };
        } catch {
          return Ye(e, t).then((e) =>
            e.success ? { value: e.data } : { issues: e.error?.issues },
          );
        }
      },
      vendor: `zod`,
      version: 1,
    }));
  }),
  $t = p(`$ZodString`, (e, t) => {
    (v.init(e, t),
      (e._zod.pattern = [...(e?._zod.bag?.patterns ?? [])].pop() ?? Ot(e._zod.bag)),
      (e._zod.parse = (n, r) => {
        if (t.coerce)
          try {
            n.value = String(n.value);
          } catch {}
        return (
          typeof n.value == `string` ||
            n.issues.push({ expected: `string`, code: `invalid_type`, input: n.value, inst: e }),
          n
        );
      }));
  }),
  y = p(`$ZodStringFormat`, (e, t) => {
    (Ut.init(e, t), $t.init(e, t));
  }),
  en = p(`$ZodGUID`, (e, t) => {
    ((t.pattern ??= dt), y.init(e, t));
  }),
  tn = p(`$ZodUUID`, (e, t) => {
    if (t.version) {
      let e = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[t.version];
      if (e === void 0) throw Error(`Invalid UUID version: "${t.version}"`);
      t.pattern ??= ft(e);
    } else t.pattern ??= ft();
    y.init(e, t);
  }),
  nn = p(`$ZodEmail`, (e, t) => {
    ((t.pattern ??= pt), y.init(e, t));
  }),
  rn = p(`$ZodURL`, (e, t) => {
    (y.init(e, t),
      (e._zod.check = (n) => {
        try {
          let r = n.value.trim(),
            i = new URL(r);
          (t.hostname &&
            ((t.hostname.lastIndex = 0),
            t.hostname.test(i.hostname) ||
              n.issues.push({
                code: `invalid_format`,
                format: `url`,
                note: `Invalid hostname`,
                pattern: t.hostname.source,
                input: n.value,
                inst: e,
                continue: !t.abort,
              })),
            t.protocol &&
              ((t.protocol.lastIndex = 0),
              t.protocol.test(i.protocol.endsWith(`:`) ? i.protocol.slice(0, -1) : i.protocol) ||
                n.issues.push({
                  code: `invalid_format`,
                  format: `url`,
                  note: `Invalid protocol`,
                  pattern: t.protocol.source,
                  input: n.value,
                  inst: e,
                  continue: !t.abort,
                })),
            t.normalize ? (n.value = i.href) : (n.value = r));
          return;
        } catch {
          n.issues.push({
            code: `invalid_format`,
            format: `url`,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  }),
  an = p(`$ZodEmoji`, (e, t) => {
    ((t.pattern ??= ht()), y.init(e, t));
  }),
  on = p(`$ZodNanoID`, (e, t) => {
    ((t.pattern ??= lt), y.init(e, t));
  }),
  sn = p(`$ZodCUID`, (e, t) => {
    ((t.pattern ??= it), y.init(e, t));
  }),
  cn = p(`$ZodCUID2`, (e, t) => {
    ((t.pattern ??= at), y.init(e, t));
  }),
  ln = p(`$ZodULID`, (e, t) => {
    ((t.pattern ??= ot), y.init(e, t));
  }),
  un = p(`$ZodXID`, (e, t) => {
    ((t.pattern ??= st), y.init(e, t));
  }),
  dn = p(`$ZodKSUID`, (e, t) => {
    ((t.pattern ??= ct), y.init(e, t));
  }),
  fn = p(`$ZodISODateTime`, (e, t) => {
    ((t.pattern ??= Dt(t)), y.init(e, t));
  }),
  pn = p(`$ZodISODate`, (e, t) => {
    ((t.pattern ??= wt), y.init(e, t));
  }),
  mn = p(`$ZodISOTime`, (e, t) => {
    ((t.pattern ??= Et(t)), y.init(e, t));
  }),
  hn = p(`$ZodISODuration`, (e, t) => {
    ((t.pattern ??= ut), y.init(e, t));
  }),
  gn = p(`$ZodIPv4`, (e, t) => {
    ((t.pattern ??= gt), y.init(e, t), (e._zod.bag.format = `ipv4`));
  }),
  _n = p(`$ZodIPv6`, (e, t) => {
    ((t.pattern ??= _t),
      y.init(e, t),
      (e._zod.bag.format = `ipv6`),
      (e._zod.check = (n) => {
        try {
          new URL(`http://[${n.value}]`);
        } catch {
          n.issues.push({
            code: `invalid_format`,
            format: `ipv6`,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  }),
  vn = p(`$ZodCIDRv4`, (e, t) => {
    ((t.pattern ??= vt), y.init(e, t));
  }),
  yn = p(`$ZodCIDRv6`, (e, t) => {
    ((t.pattern ??= yt),
      y.init(e, t),
      (e._zod.check = (n) => {
        let r = n.value.split(`/`);
        try {
          if (r.length !== 2) throw Error();
          let [e, t] = r;
          if (!t) throw Error();
          let n = Number(t);
          if (`${n}` !== t || n < 0 || n > 128) throw Error();
          new URL(`http://[${e}]`);
        } catch {
          n.issues.push({
            code: `invalid_format`,
            format: `cidrv6`,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  });
function bn(e) {
  if (e === ``) return !0;
  if (e.length % 4 != 0) return !1;
  try {
    return (atob(e), !0);
  } catch {
    return !1;
  }
}
var xn = p(`$ZodBase64`, (e, t) => {
  ((t.pattern ??= bt),
    y.init(e, t),
    (e._zod.bag.contentEncoding = `base64`),
    (e._zod.check = (n) => {
      bn(n.value) ||
        n.issues.push({
          code: `invalid_format`,
          format: `base64`,
          input: n.value,
          inst: e,
          continue: !t.abort,
        });
    }));
});
function Sn(e) {
  if (!xt.test(e)) return !1;
  let t = e.replace(/[-_]/g, (e) => (e === `-` ? `+` : `/`));
  return bn(t.padEnd(Math.ceil(t.length / 4) * 4, `=`));
}
var Cn = p(`$ZodBase64URL`, (e, t) => {
    ((t.pattern ??= xt),
      y.init(e, t),
      (e._zod.bag.contentEncoding = `base64url`),
      (e._zod.check = (n) => {
        Sn(n.value) ||
          n.issues.push({
            code: `invalid_format`,
            format: `base64url`,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  wn = p(`$ZodE164`, (e, t) => {
    ((t.pattern ??= St), y.init(e, t));
  });
function Tn(e, t = null) {
  try {
    let n = e.split(`.`);
    if (n.length !== 3) return !1;
    let [r] = n;
    if (!r) return !1;
    let i = JSON.parse(atob(r));
    return !((`typ` in i && i?.typ !== `JWT`) || !i.alg || (t && (!(`alg` in i) || i.alg !== t)));
  } catch {
    return !1;
  }
}
var En = p(`$ZodJWT`, (e, t) => {
    (y.init(e, t),
      (e._zod.check = (n) => {
        Tn(n.value, t.alg) ||
          n.issues.push({
            code: `invalid_format`,
            format: `jwt`,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Dn = p(`$ZodNumber`, (e, t) => {
    (v.init(e, t),
      (e._zod.pattern = e._zod.bag.pattern ?? At),
      (e._zod.parse = (n, r) => {
        if (t.coerce)
          try {
            n.value = Number(n.value);
          } catch {}
        let i = n.value;
        if (typeof i == `number` && !Number.isNaN(i) && Number.isFinite(i)) return n;
        let a =
          typeof i == `number`
            ? Number.isNaN(i)
              ? `NaN`
              : Number.isFinite(i)
                ? void 0
                : `Infinity`
            : void 0;
        return (
          n.issues.push({
            expected: `number`,
            code: `invalid_type`,
            input: i,
            inst: e,
            ...(a ? { received: a } : {}),
          }),
          n
        );
      }));
  }),
  On = p(`$ZodNumberFormat`, (e, t) => {
    (zt.init(e, t), Dn.init(e, t));
  }),
  kn = p(`$ZodBoolean`, (e, t) => {
    (v.init(e, t),
      (e._zod.pattern = jt),
      (e._zod.parse = (n, r) => {
        if (t.coerce)
          try {
            n.value = !!n.value;
          } catch {}
        let i = n.value;
        return (
          typeof i == `boolean` ||
            n.issues.push({ expected: `boolean`, code: `invalid_type`, input: i, inst: e }),
          n
        );
      }));
  }),
  An = p(`$ZodUndefined`, (e, t) => {
    (v.init(e, t),
      (e._zod.pattern = Mt),
      (e._zod.values = new Set([void 0])),
      (e._zod.optin = `optional`),
      (e._zod.optout = `optional`),
      (e._zod.parse = (t, n) => {
        let r = t.value;
        return (
          r === void 0 ||
            t.issues.push({ expected: `undefined`, code: `invalid_type`, input: r, inst: e }),
          t
        );
      }));
  }),
  jn = p(`$ZodUnknown`, (e, t) => {
    (v.init(e, t), (e._zod.parse = (e) => e));
  }),
  Mn = p(`$ZodNever`, (e, t) => {
    (v.init(e, t),
      (e._zod.parse = (t, n) => (
        t.issues.push({ expected: `never`, code: `invalid_type`, input: t.value, inst: e }),
        t
      )));
  }),
  Nn = p(`$ZodDate`, (e, t) => {
    (v.init(e, t),
      (e._zod.parse = (n, r) => {
        if (t.coerce)
          try {
            n.value = new Date(n.value);
          } catch {}
        let i = n.value,
          a = i instanceof Date;
        return (
          (a && !Number.isNaN(i.getTime())) ||
            n.issues.push({
              expected: `date`,
              code: `invalid_type`,
              input: i,
              ...(a ? { received: `Invalid Date` } : {}),
              inst: e,
            }),
          n
        );
      }));
  });
function Pn(e, t, n) {
  (e.issues.length && t.issues.push(...Pe(n, e.issues)), (t.value[n] = e.value));
}
var Fn = p(`$ZodArray`, (e, t) => {
  (v.init(e, t),
    (e._zod.parse = (n, r) => {
      let i = n.value;
      if (!Array.isArray(i))
        return (n.issues.push({ expected: `array`, code: `invalid_type`, input: i, inst: e }), n);
      n.value = Array(i.length);
      let a = [];
      for (let e = 0; e < i.length; e++) {
        let o = i[e],
          s = t.element._zod.run({ value: o, issues: [] }, r);
        s instanceof Promise ? a.push(s.then((t) => Pn(t, n, e))) : Pn(s, n, e);
      }
      return a.length ? Promise.all(a).then(() => n) : n;
    }));
});
function In(e, t, n, r, i) {
  if (e.issues.length) {
    if (i && !(n in r)) return;
    t.issues.push(...Pe(n, e.issues));
  }
  e.value === void 0 ? n in r && (t.value[n] = void 0) : (t.value[n] = e.value);
}
function Ln(e) {
  let t = Object.keys(e.shape);
  for (let n of t)
    if (!e.shape?.[n]?._zod?.traits?.has(`$ZodType`))
      throw Error(`Invalid element at key "${n}": expected a Zod schema`);
  let n = we(e.shape);
  return { ...e, keys: t, keySet: new Set(t), numKeys: t.length, optionalKeys: new Set(n) };
}
function Rn(e, t, n, r, i, a) {
  let o = [],
    s = i.keySet,
    c = i.catchall._zod,
    l = c.def.type,
    u = c.optout === `optional`;
  for (let i in t) {
    if (s.has(i)) continue;
    if (l === `never`) {
      o.push(i);
      continue;
    }
    let a = c.run({ value: t[i], issues: [] }, r);
    a instanceof Promise ? e.push(a.then((e) => In(e, n, i, t, u))) : In(a, n, i, t, u);
  }
  return (
    o.length && n.issues.push({ code: `unrecognized_keys`, keys: o, input: t, inst: a }),
    e.length ? Promise.all(e).then(() => n) : n
  );
}
var zn = p(`$ZodObject`, (e, t) => {
    if ((v.init(e, t), !Object.getOwnPropertyDescriptor(t, `shape`)?.get)) {
      let e = t.shape;
      Object.defineProperty(t, `shape`, {
        get: () => {
          let n = { ...e };
          return (Object.defineProperty(t, `shape`, { value: n }), n);
        },
      });
    }
    let n = ce(() => Ln(t));
    m(e._zod, `propValues`, () => {
      let e = t.shape,
        n = {};
      for (let t in e) {
        let r = e[t]._zod;
        if (r.values) {
          n[t] ?? (n[t] = new Set());
          for (let e of r.values) n[t].add(e);
        }
      }
      return n;
    });
    let r = ve,
      i = t.catchall,
      a;
    e._zod.parse = (t, o) => {
      a ??= n.value;
      let s = t.value;
      if (!r(s))
        return (t.issues.push({ expected: `object`, code: `invalid_type`, input: s, inst: e }), t);
      t.value = {};
      let c = [],
        l = a.shape;
      for (let e of a.keys) {
        let n = l[e],
          r = n._zod.optout === `optional`,
          i = n._zod.run({ value: s[e], issues: [] }, o);
        i instanceof Promise ? c.push(i.then((n) => In(n, t, e, s, r))) : In(i, t, e, s, r);
      }
      return i ? Rn(c, s, t, o, n.value, e) : c.length ? Promise.all(c).then(() => t) : t;
    };
  }),
  Bn = p(`$ZodObjectJIT`, (e, t) => {
    zn.init(e, t);
    let n = e._zod.parse,
      r = ce(() => Ln(t)),
      i = (e) => {
        let t = new Zt([`shape`, `payload`, `ctx`]),
          n = r.value,
          i = (e) => {
            let t = he(e);
            return `shape[${t}]._zod.run({ value: input[${t}], issues: [] }, ctx)`;
          };
        t.write(`const input = payload.value;`);
        let a = Object.create(null),
          o = 0;
        for (let e of n.keys) a[e] = `key_${o++}`;
        t.write(`const newResult = {};`);
        for (let r of n.keys) {
          let n = a[r],
            o = he(r),
            s = e[r]?._zod?.optout === `optional`;
          (t.write(`const ${n} = ${i(r)};`),
            s
              ? t.write(`
        if (${n}.issues.length) {
          if (${o} in input) {
            payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${o}, ...iss.path] : [${o}]
            })));
          }
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `)
              : t.write(`
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${o}, ...iss.path] : [${o}]
          })));
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `));
        }
        (t.write(`payload.value = newResult;`), t.write(`return payload;`));
        let s = t.compile();
        return (t, n) => s(e, t, n);
      },
      a,
      o = ve,
      s = !ie.jitless,
      c = s && ye.value,
      l = t.catchall,
      u;
    e._zod.parse = (d, f) => {
      u ??= r.value;
      let ee = d.value;
      return o(ee)
        ? s && c && f?.async === !1 && f.jitless !== !0
          ? ((a ||= i(t.shape)), (d = a(d, f)), l ? Rn([], ee, d, f, u, e) : d)
          : n(d, f)
        : (d.issues.push({ expected: `object`, code: `invalid_type`, input: ee, inst: e }), d);
    };
  });
function Vn(e, t, n, r) {
  for (let n of e) if (n.issues.length === 0) return ((t.value = n.value), t);
  let i = e.filter((e) => !Ne(e));
  return i.length === 1
    ? ((t.value = i[0].value), i[0])
    : (t.issues.push({
        code: `invalid_union`,
        input: t.value,
        inst: n,
        errors: e.map((e) => e.issues.map((e) => Ie(e, r, ae()))),
      }),
      t);
}
var Hn = p(`$ZodUnion`, (e, t) => {
    (v.init(e, t),
      m(e._zod, `optin`, () =>
        t.options.some((e) => e._zod.optin === `optional`) ? `optional` : void 0,
      ),
      m(e._zod, `optout`, () =>
        t.options.some((e) => e._zod.optout === `optional`) ? `optional` : void 0,
      ),
      m(e._zod, `values`, () => {
        if (t.options.every((e) => e._zod.values))
          return new Set(t.options.flatMap((e) => Array.from(e._zod.values)));
      }),
      m(e._zod, `pattern`, () => {
        if (t.options.every((e) => e._zod.pattern)) {
          let e = t.options.map((e) => e._zod.pattern);
          return RegExp(`^(${e.map((e) => ue(e.source)).join(`|`)})$`);
        }
      }));
    let n = t.options.length === 1,
      r = t.options[0]._zod.run;
    e._zod.parse = (i, a) => {
      if (n) return r(i, a);
      let o = !1,
        s = [];
      for (let e of t.options) {
        let t = e._zod.run({ value: i.value, issues: [] }, a);
        if (t instanceof Promise) (s.push(t), (o = !0));
        else {
          if (t.issues.length === 0) return t;
          s.push(t);
        }
      }
      return o ? Promise.all(s).then((t) => Vn(t, i, e, a)) : Vn(s, i, e, a);
    };
  }),
  Un = p(`$ZodDiscriminatedUnion`, (e, t) => {
    ((t.inclusive = !1), Hn.init(e, t));
    let n = e._zod.parse;
    m(e._zod, `propValues`, () => {
      let e = {};
      for (let n of t.options) {
        let r = n._zod.propValues;
        if (!r || Object.keys(r).length === 0)
          throw Error(`Invalid discriminated union option at index "${t.options.indexOf(n)}"`);
        for (let [t, n] of Object.entries(r)) {
          e[t] || (e[t] = new Set());
          for (let r of n) e[t].add(r);
        }
      }
      return e;
    });
    let r = ce(() => {
      let e = t.options,
        n = new Map();
      for (let r of e) {
        let e = r._zod.propValues?.[t.discriminator];
        if (!e || e.size === 0)
          throw Error(`Invalid discriminated union option at index "${t.options.indexOf(r)}"`);
        for (let t of e) {
          if (n.has(t)) throw Error(`Duplicate discriminator value "${String(t)}"`);
          n.set(t, r);
        }
      }
      return n;
    });
    e._zod.parse = (i, a) => {
      let o = i.value;
      if (!ve(o))
        return (i.issues.push({ code: `invalid_type`, expected: `object`, input: o, inst: e }), i);
      let s = r.value.get(o?.[t.discriminator]);
      return s
        ? s._zod.run(i, a)
        : t.unionFallback
          ? n(i, a)
          : (i.issues.push({
              code: `invalid_union`,
              errors: [],
              note: `No matching discriminator`,
              discriminator: t.discriminator,
              input: o,
              path: [t.discriminator],
              inst: e,
            }),
            i);
    };
  }),
  Wn = p(`$ZodIntersection`, (e, t) => {
    (v.init(e, t),
      (e._zod.parse = (e, n) => {
        let r = e.value,
          i = t.left._zod.run({ value: r, issues: [] }, n),
          a = t.right._zod.run({ value: r, issues: [] }, n);
        return i instanceof Promise || a instanceof Promise
          ? Promise.all([i, a]).then(([t, n]) => Kn(e, t, n))
          : Kn(e, i, a);
      }));
  });
function Gn(e, t) {
  if (e === t || (e instanceof Date && t instanceof Date && +e == +t))
    return { valid: !0, data: e };
  if (be(e) && be(t)) {
    let n = Object.keys(t),
      r = Object.keys(e).filter((e) => n.indexOf(e) !== -1),
      i = { ...e, ...t };
    for (let n of r) {
      let r = Gn(e[n], t[n]);
      if (!r.valid) return { valid: !1, mergeErrorPath: [n, ...r.mergeErrorPath] };
      i[n] = r.data;
    }
    return { valid: !0, data: i };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return { valid: !1, mergeErrorPath: [] };
    let n = [];
    for (let r = 0; r < e.length; r++) {
      let i = e[r],
        a = t[r],
        o = Gn(i, a);
      if (!o.valid) return { valid: !1, mergeErrorPath: [r, ...o.mergeErrorPath] };
      n.push(o.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function Kn(e, t, n) {
  let r = new Map(),
    i;
  for (let n of t.issues)
    if (n.code === `unrecognized_keys`) {
      i ??= n;
      for (let e of n.keys) (r.has(e) || r.set(e, {}), (r.get(e).l = !0));
    } else e.issues.push(n);
  for (let t of n.issues)
    if (t.code === `unrecognized_keys`)
      for (let e of t.keys) (r.has(e) || r.set(e, {}), (r.get(e).r = !0));
    else e.issues.push(t);
  let a = [...r].filter(([, e]) => e.l && e.r).map(([e]) => e);
  if ((a.length && i && e.issues.push({ ...i, keys: a }), Ne(e))) return e;
  let o = Gn(t.value, n.value);
  if (!o.valid)
    throw Error(`Unmergable intersection. Error path: ${JSON.stringify(o.mergeErrorPath)}`);
  return ((e.value = o.data), e);
}
var qn = p(`$ZodRecord`, (e, t) => {
    (v.init(e, t),
      (e._zod.parse = (n, r) => {
        let i = n.value;
        if (!be(i))
          return (
            n.issues.push({ expected: `record`, code: `invalid_type`, input: i, inst: e }),
            n
          );
        let a = [],
          o = t.keyType._zod.values;
        if (o) {
          n.value = {};
          let s = new Set();
          for (let e of o)
            if (typeof e == `string` || typeof e == `number` || typeof e == `symbol`) {
              s.add(typeof e == `number` ? e.toString() : e);
              let o = t.valueType._zod.run({ value: i[e], issues: [] }, r);
              o instanceof Promise
                ? a.push(
                    o.then((t) => {
                      (t.issues.length && n.issues.push(...Pe(e, t.issues)),
                        (n.value[e] = t.value));
                    }),
                  )
                : (o.issues.length && n.issues.push(...Pe(e, o.issues)), (n.value[e] = o.value));
            }
          let c;
          for (let e in i) s.has(e) || ((c ??= []), c.push(e));
          c &&
            c.length > 0 &&
            n.issues.push({ code: `unrecognized_keys`, input: i, inst: e, keys: c });
        } else {
          n.value = {};
          for (let o of Reflect.ownKeys(i)) {
            if (o === `__proto__`) continue;
            let s = t.keyType._zod.run({ value: o, issues: [] }, r);
            if (s instanceof Promise)
              throw Error(`Async schemas not supported in object keys currently`);
            if (typeof o == `string` && At.test(o) && s.issues.length) {
              let e = t.keyType._zod.run({ value: Number(o), issues: [] }, r);
              if (e instanceof Promise)
                throw Error(`Async schemas not supported in object keys currently`);
              e.issues.length === 0 && (s = e);
            }
            if (s.issues.length) {
              t.mode === `loose`
                ? (n.value[o] = i[o])
                : n.issues.push({
                    code: `invalid_key`,
                    origin: `record`,
                    issues: s.issues.map((e) => Ie(e, r, ae())),
                    input: o,
                    path: [o],
                    inst: e,
                  });
              continue;
            }
            let c = t.valueType._zod.run({ value: i[o], issues: [] }, r);
            c instanceof Promise
              ? a.push(
                  c.then((e) => {
                    (e.issues.length && n.issues.push(...Pe(o, e.issues)),
                      (n.value[s.value] = e.value));
                  }),
                )
              : (c.issues.length && n.issues.push(...Pe(o, c.issues)),
                (n.value[s.value] = c.value));
          }
        }
        return a.length ? Promise.all(a).then(() => n) : n;
      }));
  }),
  Jn = p(`$ZodEnum`, (e, t) => {
    v.init(e, t);
    let n = oe(t.entries),
      r = new Set(n);
    ((e._zod.values = r),
      (e._zod.pattern = RegExp(
        `^(${n
          .filter((e) => Se.has(typeof e))
          .map((e) => (typeof e == `string` ? Ce(e) : e.toString()))
          .join(`|`)})$`,
      )),
      (e._zod.parse = (t, i) => {
        let a = t.value;
        return (
          r.has(a) || t.issues.push({ code: `invalid_value`, values: n, input: a, inst: e }),
          t
        );
      }));
  }),
  Yn = p(`$ZodLiteral`, (e, t) => {
    if ((v.init(e, t), t.values.length === 0))
      throw Error(`Cannot create literal schema with no valid values`);
    let n = new Set(t.values);
    ((e._zod.values = n),
      (e._zod.pattern = RegExp(
        `^(${t.values.map((e) => (typeof e == `string` ? Ce(e) : e ? Ce(e.toString()) : String(e))).join(`|`)})$`,
      )),
      (e._zod.parse = (r, i) => {
        let a = r.value;
        return (
          n.has(a) || r.issues.push({ code: `invalid_value`, values: t.values, input: a, inst: e }),
          r
        );
      }));
  }),
  Xn = p(`$ZodTransform`, (e, t) => {
    (v.init(e, t),
      (e._zod.parse = (n, r) => {
        if (r.direction === `backward`) throw new re(e.constructor.name);
        let i = t.transform(n.value, n);
        if (r.async)
          return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => ((n.value = e), n));
        if (i instanceof Promise) throw new ne();
        return ((n.value = i), n);
      }));
  });
function Zn(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
var Qn = p(`$ZodOptional`, (e, t) => {
    (v.init(e, t),
      (e._zod.optin = `optional`),
      (e._zod.optout = `optional`),
      m(e._zod, `values`, () =>
        t.innerType._zod.values ? new Set([...t.innerType._zod.values, void 0]) : void 0,
      ),
      m(e._zod, `pattern`, () => {
        let e = t.innerType._zod.pattern;
        return e ? RegExp(`^(${ue(e.source)})?$`) : void 0;
      }),
      (e._zod.parse = (e, n) => {
        if (t.innerType._zod.optin === `optional`) {
          let r = t.innerType._zod.run(e, n);
          return r instanceof Promise ? r.then((t) => Zn(t, e.value)) : Zn(r, e.value);
        }
        return e.value === void 0 ? e : t.innerType._zod.run(e, n);
      }));
  }),
  $n = p(`$ZodExactOptional`, (e, t) => {
    (Qn.init(e, t),
      m(e._zod, `values`, () => t.innerType._zod.values),
      m(e._zod, `pattern`, () => t.innerType._zod.pattern),
      (e._zod.parse = (e, n) => t.innerType._zod.run(e, n)));
  }),
  er = p(`$ZodNullable`, (e, t) => {
    (v.init(e, t),
      m(e._zod, `optin`, () => t.innerType._zod.optin),
      m(e._zod, `optout`, () => t.innerType._zod.optout),
      m(e._zod, `pattern`, () => {
        let e = t.innerType._zod.pattern;
        return e ? RegExp(`^(${ue(e.source)}|null)$`) : void 0;
      }),
      m(e._zod, `values`, () =>
        t.innerType._zod.values ? new Set([...t.innerType._zod.values, null]) : void 0,
      ),
      (e._zod.parse = (e, n) => (e.value === null ? e : t.innerType._zod.run(e, n))));
  }),
  tr = p(`$ZodDefault`, (e, t) => {
    (v.init(e, t),
      (e._zod.optin = `optional`),
      m(e._zod, `values`, () => t.innerType._zod.values),
      (e._zod.parse = (e, n) => {
        if (n.direction === `backward`) return t.innerType._zod.run(e, n);
        if (e.value === void 0) return ((e.value = t.defaultValue), e);
        let r = t.innerType._zod.run(e, n);
        return r instanceof Promise ? r.then((e) => nr(e, t)) : nr(r, t);
      }));
  });
function nr(e, t) {
  return (e.value === void 0 && (e.value = t.defaultValue), e);
}
var rr = p(`$ZodPrefault`, (e, t) => {
    (v.init(e, t),
      (e._zod.optin = `optional`),
      m(e._zod, `values`, () => t.innerType._zod.values),
      (e._zod.parse = (e, n) => (
        n.direction === `backward` || (e.value === void 0 && (e.value = t.defaultValue)),
        t.innerType._zod.run(e, n)
      )));
  }),
  ir = p(`$ZodNonOptional`, (e, t) => {
    (v.init(e, t),
      m(e._zod, `values`, () => {
        let e = t.innerType._zod.values;
        return e ? new Set([...e].filter((e) => e !== void 0)) : void 0;
      }),
      (e._zod.parse = (n, r) => {
        let i = t.innerType._zod.run(n, r);
        return i instanceof Promise ? i.then((t) => ar(t, e)) : ar(i, e);
      }));
  });
function ar(e, t) {
  return (
    !e.issues.length &&
      e.value === void 0 &&
      e.issues.push({ code: `invalid_type`, expected: `nonoptional`, input: e.value, inst: t }),
    e
  );
}
var or = p(`$ZodCatch`, (e, t) => {
    (v.init(e, t),
      m(e._zod, `optin`, () => t.innerType._zod.optin),
      m(e._zod, `optout`, () => t.innerType._zod.optout),
      m(e._zod, `values`, () => t.innerType._zod.values),
      (e._zod.parse = (e, n) => {
        if (n.direction === `backward`) return t.innerType._zod.run(e, n);
        let r = t.innerType._zod.run(e, n);
        return r instanceof Promise
          ? r.then(
              (r) => (
                (e.value = r.value),
                r.issues.length &&
                  ((e.value = t.catchValue({
                    ...e,
                    error: { issues: r.issues.map((e) => Ie(e, n, ae())) },
                    input: e.value,
                  })),
                  (e.issues = [])),
                e
              ),
            )
          : ((e.value = r.value),
            r.issues.length &&
              ((e.value = t.catchValue({
                ...e,
                error: { issues: r.issues.map((e) => Ie(e, n, ae())) },
                input: e.value,
              })),
              (e.issues = [])),
            e);
      }));
  }),
  sr = p(`$ZodPipe`, (e, t) => {
    (v.init(e, t),
      m(e._zod, `values`, () => t.in._zod.values),
      m(e._zod, `optin`, () => t.in._zod.optin),
      m(e._zod, `optout`, () => t.out._zod.optout),
      m(e._zod, `propValues`, () => t.in._zod.propValues),
      (e._zod.parse = (e, n) => {
        if (n.direction === `backward`) {
          let r = t.out._zod.run(e, n);
          return r instanceof Promise ? r.then((e) => cr(e, t.in, n)) : cr(r, t.in, n);
        }
        let r = t.in._zod.run(e, n);
        return r instanceof Promise ? r.then((e) => cr(e, t.out, n)) : cr(r, t.out, n);
      }));
  });
function cr(e, t, n) {
  return e.issues.length
    ? ((e.aborted = !0), e)
    : t._zod.run({ value: e.value, issues: e.issues }, n);
}
var lr = p(`$ZodReadonly`, (e, t) => {
  (v.init(e, t),
    m(e._zod, `propValues`, () => t.innerType._zod.propValues),
    m(e._zod, `values`, () => t.innerType._zod.values),
    m(e._zod, `optin`, () => t.innerType?._zod?.optin),
    m(e._zod, `optout`, () => t.innerType?._zod?.optout),
    (e._zod.parse = (e, n) => {
      if (n.direction === `backward`) return t.innerType._zod.run(e, n);
      let r = t.innerType._zod.run(e, n);
      return r instanceof Promise ? r.then(ur) : ur(r);
    }));
});
function ur(e) {
  return ((e.value = Object.freeze(e.value)), e);
}
var dr = p(`$ZodCustom`, (e, t) => {
  (_.init(e, t),
    v.init(e, t),
    (e._zod.parse = (e, t) => e),
    (e._zod.check = (n) => {
      let r = n.value,
        i = t.fn(r);
      if (i instanceof Promise) return i.then((t) => fr(t, n, r, e));
      fr(i, n, r, e);
    }));
});
function fr(e, t, n, r) {
  if (!e) {
    let e = {
      code: `custom`,
      input: n,
      inst: r,
      path: [...(r._zod.def.path ?? [])],
      continue: !r._zod.def.abort,
    };
    (r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(Re(e)));
  }
}
var pr,
  mr = class {
    constructor() {
      ((this._map = new WeakMap()), (this._idmap = new Map()));
    }
    add(e, ...t) {
      let n = t[0];
      return (
        this._map.set(e, n),
        n && typeof n == `object` && `id` in n && this._idmap.set(n.id, e),
        this
      );
    }
    clear() {
      return ((this._map = new WeakMap()), (this._idmap = new Map()), this);
    }
    remove(e) {
      let t = this._map.get(e);
      return (
        t && typeof t == `object` && `id` in t && this._idmap.delete(t.id),
        this._map.delete(e),
        this
      );
    }
    get(e) {
      let t = e._zod.parent;
      if (t) {
        let n = { ...(this.get(t) ?? {}) };
        delete n.id;
        let r = { ...n, ...this._map.get(e) };
        return Object.keys(r).length ? r : void 0;
      }
      return this._map.get(e);
    }
    has(e) {
      return this._map.has(e);
    }
  };
function hr() {
  return new mr();
}
(pr = globalThis).__zod_globalRegistry ?? (pr.__zod_globalRegistry = hr());
var gr = globalThis.__zod_globalRegistry;
function _r(e, t) {
  return new e({ type: `string`, ...g(t) });
}
function vr(e, t) {
  return new e({ type: `string`, format: `email`, check: `string_format`, abort: !1, ...g(t) });
}
function yr(e, t) {
  return new e({ type: `string`, format: `guid`, check: `string_format`, abort: !1, ...g(t) });
}
function br(e, t) {
  return new e({ type: `string`, format: `uuid`, check: `string_format`, abort: !1, ...g(t) });
}
function xr(e, t) {
  return new e({
    type: `string`,
    format: `uuid`,
    check: `string_format`,
    abort: !1,
    version: `v4`,
    ...g(t),
  });
}
function Sr(e, t) {
  return new e({
    type: `string`,
    format: `uuid`,
    check: `string_format`,
    abort: !1,
    version: `v6`,
    ...g(t),
  });
}
function Cr(e, t) {
  return new e({
    type: `string`,
    format: `uuid`,
    check: `string_format`,
    abort: !1,
    version: `v7`,
    ...g(t),
  });
}
function wr(e, t) {
  return new e({ type: `string`, format: `url`, check: `string_format`, abort: !1, ...g(t) });
}
function Tr(e, t) {
  return new e({ type: `string`, format: `emoji`, check: `string_format`, abort: !1, ...g(t) });
}
function Er(e, t) {
  return new e({ type: `string`, format: `nanoid`, check: `string_format`, abort: !1, ...g(t) });
}
function Dr(e, t) {
  return new e({ type: `string`, format: `cuid`, check: `string_format`, abort: !1, ...g(t) });
}
function Or(e, t) {
  return new e({ type: `string`, format: `cuid2`, check: `string_format`, abort: !1, ...g(t) });
}
function kr(e, t) {
  return new e({ type: `string`, format: `ulid`, check: `string_format`, abort: !1, ...g(t) });
}
function Ar(e, t) {
  return new e({ type: `string`, format: `xid`, check: `string_format`, abort: !1, ...g(t) });
}
function jr(e, t) {
  return new e({ type: `string`, format: `ksuid`, check: `string_format`, abort: !1, ...g(t) });
}
function Mr(e, t) {
  return new e({ type: `string`, format: `ipv4`, check: `string_format`, abort: !1, ...g(t) });
}
function Nr(e, t) {
  return new e({ type: `string`, format: `ipv6`, check: `string_format`, abort: !1, ...g(t) });
}
function Pr(e, t) {
  return new e({ type: `string`, format: `cidrv4`, check: `string_format`, abort: !1, ...g(t) });
}
function Fr(e, t) {
  return new e({ type: `string`, format: `cidrv6`, check: `string_format`, abort: !1, ...g(t) });
}
function Ir(e, t) {
  return new e({ type: `string`, format: `base64`, check: `string_format`, abort: !1, ...g(t) });
}
function Lr(e, t) {
  return new e({ type: `string`, format: `base64url`, check: `string_format`, abort: !1, ...g(t) });
}
function Rr(e, t) {
  return new e({ type: `string`, format: `e164`, check: `string_format`, abort: !1, ...g(t) });
}
function zr(e, t) {
  return new e({ type: `string`, format: `jwt`, check: `string_format`, abort: !1, ...g(t) });
}
function Br(e, t) {
  return new e({
    type: `string`,
    format: `datetime`,
    check: `string_format`,
    offset: !1,
    local: !1,
    precision: null,
    ...g(t),
  });
}
function Vr(e, t) {
  return new e({ type: `string`, format: `date`, check: `string_format`, ...g(t) });
}
function Hr(e, t) {
  return new e({
    type: `string`,
    format: `time`,
    check: `string_format`,
    precision: null,
    ...g(t),
  });
}
function Ur(e, t) {
  return new e({ type: `string`, format: `duration`, check: `string_format`, ...g(t) });
}
function Wr(e, t) {
  return new e({ type: `number`, checks: [], ...g(t) });
}
function Gr(e, t) {
  return new e({ type: `number`, check: `number_format`, abort: !1, format: `safeint`, ...g(t) });
}
function Kr(e, t) {
  return new e({ type: `boolean`, ...g(t) });
}
function qr(e, t) {
  return new e({ type: `undefined`, ...g(t) });
}
function Jr(e) {
  return new e({ type: `unknown` });
}
function Yr(e, t) {
  return new e({ type: `never`, ...g(t) });
}
function Xr(e, t) {
  return new e({ type: `date`, ...g(t) });
}
function Zr(e, t) {
  return new It({ check: `less_than`, ...g(t), value: e, inclusive: !1 });
}
function Qr(e, t) {
  return new It({ check: `less_than`, ...g(t), value: e, inclusive: !0 });
}
function $r(e, t) {
  return new Lt({ check: `greater_than`, ...g(t), value: e, inclusive: !1 });
}
function ei(e, t) {
  return new Lt({ check: `greater_than`, ...g(t), value: e, inclusive: !0 });
}
function ti(e, t) {
  return new Rt({ check: `multiple_of`, ...g(t), value: e });
}
function ni(e, t) {
  return new Bt({ check: `max_length`, ...g(t), maximum: e });
}
function ri(e, t) {
  return new Vt({ check: `min_length`, ...g(t), minimum: e });
}
function ii(e, t) {
  return new Ht({ check: `length_equals`, ...g(t), length: e });
}
function ai(e, t) {
  return new Wt({ check: `string_format`, format: `regex`, ...g(t), pattern: e });
}
function oi(e) {
  return new Gt({ check: `string_format`, format: `lowercase`, ...g(e) });
}
function si(e) {
  return new Kt({ check: `string_format`, format: `uppercase`, ...g(e) });
}
function ci(e, t) {
  return new qt({ check: `string_format`, format: `includes`, ...g(t), includes: e });
}
function li(e, t) {
  return new Jt({ check: `string_format`, format: `starts_with`, ...g(t), prefix: e });
}
function ui(e, t) {
  return new Yt({ check: `string_format`, format: `ends_with`, ...g(t), suffix: e });
}
function di(e) {
  return new Xt({ check: `overwrite`, tx: e });
}
function fi(e) {
  return di((t) => t.normalize(e));
}
function pi() {
  return di((e) => e.trim());
}
function mi() {
  return di((e) => e.toLowerCase());
}
function hi() {
  return di((e) => e.toUpperCase());
}
function gi() {
  return di((e) => ge(e));
}
function _i(e, t, n) {
  return new e({ type: `array`, element: t, ...g(n) });
}
function vi(e, t, n) {
  return new e({ type: `custom`, check: `custom`, fn: t, ...g(n) });
}
function yi(e) {
  let t = bi(
    (n) => (
      (n.addIssue = (e) => {
        if (typeof e == `string`) n.issues.push(Re(e, n.value, t._zod.def));
        else {
          let r = e;
          (r.fatal && (r.continue = !1),
            (r.code ??= `custom`),
            (r.input ??= n.value),
            (r.inst ??= t),
            (r.continue ??= !t._zod.def.abort),
            n.issues.push(Re(r)));
        }
      }),
      e(n.value, n)
    ),
  );
  return t;
}
function bi(e, t) {
  let n = new _({ check: `custom`, ...g(t) });
  return ((n._zod.check = e), n);
}
function xi(e) {
  let t = e?.target ?? `draft-2020-12`;
  return (
    t === `draft-4` && (t = `draft-04`),
    t === `draft-7` && (t = `draft-07`),
    {
      processors: e.processors ?? {},
      metadataRegistry: e?.metadata ?? gr,
      target: t,
      unrepresentable: e?.unrepresentable ?? `throw`,
      override: e?.override ?? (() => {}),
      io: e?.io ?? `output`,
      counter: 0,
      seen: new Map(),
      cycles: e?.cycles ?? `ref`,
      reused: e?.reused ?? `inline`,
      external: e?.external ?? void 0,
    }
  );
}
function b(e, t, n = { path: [], schemaPath: [] }) {
  var r;
  let i = e._zod.def,
    a = t.seen.get(e);
  if (a) return (a.count++, n.schemaPath.includes(e) && (a.cycle = n.path), a.schema);
  let o = { schema: {}, count: 1, cycle: void 0, path: n.path };
  t.seen.set(e, o);
  let s = e._zod.toJSONSchema?.();
  if (s) o.schema = s;
  else {
    let r = { ...n, schemaPath: [...n.schemaPath, e], path: n.path };
    if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, o.schema, r);
    else {
      let n = o.schema,
        a = t.processors[i.type];
      if (!a) throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);
      a(e, t, n, r);
    }
    let a = e._zod.parent;
    a && ((o.ref ||= a), b(a, t, r), (t.seen.get(a).isParent = !0));
  }
  let c = t.metadataRegistry.get(e);
  return (
    c && Object.assign(o.schema, c),
    t.io === `input` && x(e) && (delete o.schema.examples, delete o.schema.default),
    t.io === `input` &&
      o.schema._prefault &&
      ((r = o.schema).default ?? (r.default = o.schema._prefault)),
    delete o.schema._prefault,
    t.seen.get(e).schema
  );
}
function Si(e, t) {
  let n = e.seen.get(t);
  if (!n) throw Error(`Unprocessed schema. This is a bug in Zod.`);
  let r = new Map();
  for (let t of e.seen.entries()) {
    let n = e.metadataRegistry.get(t[0])?.id;
    if (n) {
      let e = r.get(n);
      if (e && e !== t[0])
        throw Error(
          `Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`,
        );
      r.set(n, t[0]);
    }
  }
  let i = (t) => {
      let r = e.target === `draft-2020-12` ? `$defs` : `definitions`;
      if (e.external) {
        let n = e.external.registry.get(t[0])?.id,
          i = e.external.uri ?? ((e) => e);
        if (n) return { ref: i(n) };
        let a = t[1].defId ?? t[1].schema.id ?? `schema${e.counter++}`;
        return ((t[1].defId = a), { defId: a, ref: `${i(`__shared`)}#/${r}/${a}` });
      }
      if (t[1] === n) return { ref: `#` };
      let i = `#/${r}/`,
        a = t[1].schema.id ?? `__schema${e.counter++}`;
      return { defId: a, ref: i + a };
    },
    a = (e) => {
      if (e[1].schema.$ref) return;
      let t = e[1],
        { ref: n, defId: r } = i(e);
      ((t.def = { ...t.schema }), r && (t.defId = r));
      let a = t.schema;
      for (let e in a) delete a[e];
      a.$ref = n;
    };
  if (e.cycles === `throw`)
    for (let t of e.seen.entries()) {
      let e = t[1];
      if (e.cycle)
        throw Error(`Cycle detected: #/${e.cycle?.join(`/`)}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (let n of e.seen.entries()) {
    let r = n[1];
    if (t === n[0]) {
      a(n);
      continue;
    }
    if (e.external) {
      let r = e.external.registry.get(n[0])?.id;
      if (t !== n[0] && r) {
        a(n);
        continue;
      }
    }
    if (e.metadataRegistry.get(n[0])?.id) {
      a(n);
      continue;
    }
    if (r.cycle) {
      a(n);
      continue;
    }
    if (r.count > 1 && e.reused === `ref`) {
      a(n);
      continue;
    }
  }
}
function Ci(e, t) {
  let n = e.seen.get(t);
  if (!n) throw Error(`Unprocessed schema. This is a bug in Zod.`);
  let r = (t) => {
    let n = e.seen.get(t);
    if (n.ref === null) return;
    let i = n.def ?? n.schema,
      a = { ...i },
      o = n.ref;
    if (((n.ref = null), o)) {
      r(o);
      let n = e.seen.get(o),
        s = n.schema;
      if (
        (s.$ref &&
        (e.target === `draft-07` || e.target === `draft-04` || e.target === `openapi-3.0`)
          ? ((i.allOf = i.allOf ?? []), i.allOf.push(s))
          : Object.assign(i, s),
        Object.assign(i, a),
        t._zod.parent === o)
      )
        for (let e in i) e === `$ref` || e === `allOf` || e in a || delete i[e];
      if (s.$ref && n.def)
        for (let e in i)
          e === `$ref` ||
            e === `allOf` ||
            (e in n.def && JSON.stringify(i[e]) === JSON.stringify(n.def[e]) && delete i[e]);
    }
    let s = t._zod.parent;
    if (s && s !== o) {
      r(s);
      let t = e.seen.get(s);
      if (t?.schema.$ref && ((i.$ref = t.schema.$ref), t.def))
        for (let e in i)
          e === `$ref` ||
            e === `allOf` ||
            (e in t.def && JSON.stringify(i[e]) === JSON.stringify(t.def[e]) && delete i[e]);
    }
    e.override({ zodSchema: t, jsonSchema: i, path: n.path ?? [] });
  };
  for (let t of [...e.seen.entries()].reverse()) r(t[0]);
  let i = {};
  if (
    (e.target === `draft-2020-12`
      ? (i.$schema = `https://json-schema.org/draft/2020-12/schema`)
      : e.target === `draft-07`
        ? (i.$schema = `http://json-schema.org/draft-07/schema#`)
        : e.target === `draft-04`
          ? (i.$schema = `http://json-schema.org/draft-04/schema#`)
          : e.target,
    e.external?.uri)
  ) {
    let n = e.external.registry.get(t)?.id;
    if (!n) throw Error("Schema is missing an `id` property");
    i.$id = e.external.uri(n);
  }
  Object.assign(i, n.def ?? n.schema);
  let a = e.external?.defs ?? {};
  for (let t of e.seen.entries()) {
    let e = t[1];
    e.def && e.defId && (a[e.defId] = e.def);
  }
  e.external ||
    (Object.keys(a).length > 0 &&
      (e.target === `draft-2020-12` ? (i.$defs = a) : (i.definitions = a)));
  try {
    let n = JSON.parse(JSON.stringify(i));
    return (
      Object.defineProperty(n, `~standard`, {
        value: {
          ...t[`~standard`],
          jsonSchema: {
            input: Ti(t, `input`, e.processors),
            output: Ti(t, `output`, e.processors),
          },
        },
        enumerable: !1,
        writable: !1,
      }),
      n
    );
  } catch {
    throw Error(`Error converting schema to JSON.`);
  }
}
function x(e, t) {
  let n = t ?? { seen: new Set() };
  if (n.seen.has(e)) return !1;
  n.seen.add(e);
  let r = e._zod.def;
  if (r.type === `transform`) return !0;
  if (r.type === `array`) return x(r.element, n);
  if (r.type === `set`) return x(r.valueType, n);
  if (r.type === `lazy`) return x(r.getter(), n);
  if (
    r.type === `promise` ||
    r.type === `optional` ||
    r.type === `nonoptional` ||
    r.type === `nullable` ||
    r.type === `readonly` ||
    r.type === `default` ||
    r.type === `prefault`
  )
    return x(r.innerType, n);
  if (r.type === `intersection`) return x(r.left, n) || x(r.right, n);
  if (r.type === `record` || r.type === `map`) return x(r.keyType, n) || x(r.valueType, n);
  if (r.type === `pipe`) return x(r.in, n) || x(r.out, n);
  if (r.type === `object`) {
    for (let e in r.shape) if (x(r.shape[e], n)) return !0;
    return !1;
  }
  if (r.type === `union`) {
    for (let e of r.options) if (x(e, n)) return !0;
    return !1;
  }
  if (r.type === `tuple`) {
    for (let e of r.items) if (x(e, n)) return !0;
    return !!(r.rest && x(r.rest, n));
  }
  return !1;
}
var wi =
    (e, t = {}) =>
    (n) => {
      let r = xi({ ...n, processors: t });
      return (b(e, r), Si(r, e), Ci(r, e));
    },
  Ti =
    (e, t, n = {}) =>
    (r) => {
      let { libraryOptions: i, target: a } = r ?? {},
        o = xi({ ...(i ?? {}), target: a, io: t, processors: n });
      return (b(e, o), Si(o, e), Ci(o, e));
    },
  Ei = { guid: `uuid`, url: `uri`, datetime: `date-time`, json_string: `json-string`, regex: `` },
  Di = (e, t, n, r) => {
    let i = n;
    i.type = `string`;
    let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l } = e._zod.bag;
    if (
      (typeof a == `number` && (i.minLength = a),
      typeof o == `number` && (i.maxLength = o),
      s &&
        ((i.format = Ei[s] ?? s),
        i.format === `` && delete i.format,
        s === `time` && delete i.format),
      l && (i.contentEncoding = l),
      c && c.size > 0)
    ) {
      let e = [...c];
      e.length === 1
        ? (i.pattern = e[0].source)
        : e.length > 1 &&
          (i.allOf = [
            ...e.map((e) => ({
              ...(t.target === `draft-07` || t.target === `draft-04` || t.target === `openapi-3.0`
                ? { type: `string` }
                : {}),
              pattern: e.source,
            })),
          ]);
    }
  },
  Oi = (e, t, n, r) => {
    let i = n,
      {
        minimum: a,
        maximum: o,
        format: s,
        multipleOf: c,
        exclusiveMaximum: l,
        exclusiveMinimum: u,
      } = e._zod.bag;
    (typeof s == `string` && s.includes(`int`) ? (i.type = `integer`) : (i.type = `number`),
      typeof u == `number` &&
        (t.target === `draft-04` || t.target === `openapi-3.0`
          ? ((i.minimum = u), (i.exclusiveMinimum = !0))
          : (i.exclusiveMinimum = u)),
      typeof a == `number` &&
        ((i.minimum = a),
        typeof u == `number` &&
          t.target !== `draft-04` &&
          (u >= a ? delete i.minimum : delete i.exclusiveMinimum)),
      typeof l == `number` &&
        (t.target === `draft-04` || t.target === `openapi-3.0`
          ? ((i.maximum = l), (i.exclusiveMaximum = !0))
          : (i.exclusiveMaximum = l)),
      typeof o == `number` &&
        ((i.maximum = o),
        typeof l == `number` &&
          t.target !== `draft-04` &&
          (l <= o ? delete i.maximum : delete i.exclusiveMaximum)),
      typeof c == `number` && (i.multipleOf = c));
  },
  ki = (e, t, n, r) => {
    n.type = `boolean`;
  },
  Ai = (e, t, n, r) => {
    if (t.unrepresentable === `throw`)
      throw Error(`Undefined cannot be represented in JSON Schema`);
  },
  ji = (e, t, n, r) => {
    n.not = {};
  },
  Mi = (e, t, n, r) => {
    if (t.unrepresentable === `throw`) throw Error(`Date cannot be represented in JSON Schema`);
  },
  Ni = (e, t, n, r) => {
    let i = e._zod.def,
      a = oe(i.entries);
    (a.every((e) => typeof e == `number`) && (n.type = `number`),
      a.every((e) => typeof e == `string`) && (n.type = `string`),
      (n.enum = a));
  },
  Pi = (e, t, n, r) => {
    let i = e._zod.def,
      a = [];
    for (let e of i.values)
      if (e === void 0) {
        if (t.unrepresentable === `throw`)
          throw Error("Literal `undefined` cannot be represented in JSON Schema");
      } else if (typeof e == `bigint`) {
        if (t.unrepresentable === `throw`)
          throw Error(`BigInt literals cannot be represented in JSON Schema`);
        a.push(Number(e));
      } else a.push(e);
    if (a.length !== 0)
      if (a.length === 1) {
        let e = a[0];
        ((n.type = e === null ? `null` : typeof e),
          t.target === `draft-04` || t.target === `openapi-3.0` ? (n.enum = [e]) : (n.const = e));
      } else
        (a.every((e) => typeof e == `number`) && (n.type = `number`),
          a.every((e) => typeof e == `string`) && (n.type = `string`),
          a.every((e) => typeof e == `boolean`) && (n.type = `boolean`),
          a.every((e) => e === null) && (n.type = `null`),
          (n.enum = a));
  },
  Fi = (e, t, n, r) => {
    if (t.unrepresentable === `throw`)
      throw Error(`Custom types cannot be represented in JSON Schema`);
  },
  Ii = (e, t, n, r) => {
    if (t.unrepresentable === `throw`)
      throw Error(`Transforms cannot be represented in JSON Schema`);
  },
  Li = (e, t, n, r) => {
    let i = n,
      a = e._zod.def,
      { minimum: o, maximum: s } = e._zod.bag;
    (typeof o == `number` && (i.minItems = o),
      typeof s == `number` && (i.maxItems = s),
      (i.type = `array`),
      (i.items = b(a.element, t, { ...r, path: [...r.path, `items`] })));
  },
  Ri = (e, t, n, r) => {
    let i = n,
      a = e._zod.def;
    ((i.type = `object`), (i.properties = {}));
    let o = a.shape;
    for (let e in o) i.properties[e] = b(o[e], t, { ...r, path: [...r.path, `properties`, e] });
    let s = new Set(Object.keys(o)),
      c = new Set(
        [...s].filter((e) => {
          let n = a.shape[e]._zod;
          return t.io === `input` ? n.optin === void 0 : n.optout === void 0;
        }),
      );
    (c.size > 0 && (i.required = Array.from(c)),
      a.catchall?._zod.def.type === `never`
        ? (i.additionalProperties = !1)
        : a.catchall
          ? a.catchall &&
            (i.additionalProperties = b(a.catchall, t, {
              ...r,
              path: [...r.path, `additionalProperties`],
            }))
          : t.io === `output` && (i.additionalProperties = !1));
  },
  zi = (e, t, n, r) => {
    let i = e._zod.def,
      a = i.inclusive === !1,
      o = i.options.map((e, n) => b(e, t, { ...r, path: [...r.path, a ? `oneOf` : `anyOf`, n] }));
    a ? (n.oneOf = o) : (n.anyOf = o);
  },
  Bi = (e, t, n, r) => {
    let i = e._zod.def,
      a = b(i.left, t, { ...r, path: [...r.path, `allOf`, 0] }),
      o = b(i.right, t, { ...r, path: [...r.path, `allOf`, 1] }),
      s = (e) => `allOf` in e && Object.keys(e).length === 1;
    n.allOf = [...(s(a) ? a.allOf : [a]), ...(s(o) ? o.allOf : [o])];
  },
  Vi = (e, t, n, r) => {
    let i = n,
      a = e._zod.def;
    i.type = `object`;
    let o = a.keyType,
      s = o._zod.bag?.patterns;
    if (a.mode === `loose` && s && s.size > 0) {
      let e = b(a.valueType, t, { ...r, path: [...r.path, `patternProperties`, `*`] });
      i.patternProperties = {};
      for (let t of s) i.patternProperties[t.source] = e;
    } else
      ((t.target === `draft-07` || t.target === `draft-2020-12`) &&
        (i.propertyNames = b(a.keyType, t, { ...r, path: [...r.path, `propertyNames`] })),
        (i.additionalProperties = b(a.valueType, t, {
          ...r,
          path: [...r.path, `additionalProperties`],
        })));
    let c = o._zod.values;
    if (c) {
      let e = [...c].filter((e) => typeof e == `string` || typeof e == `number`);
      e.length > 0 && (i.required = e);
    }
  },
  Hi = (e, t, n, r) => {
    let i = e._zod.def,
      a = b(i.innerType, t, r),
      o = t.seen.get(e);
    t.target === `openapi-3.0`
      ? ((o.ref = i.innerType), (n.nullable = !0))
      : (n.anyOf = [a, { type: `null` }]);
  },
  Ui = (e, t, n, r) => {
    let i = e._zod.def;
    b(i.innerType, t, r);
    let a = t.seen.get(e);
    a.ref = i.innerType;
  },
  Wi = (e, t, n, r) => {
    let i = e._zod.def;
    b(i.innerType, t, r);
    let a = t.seen.get(e);
    ((a.ref = i.innerType), (n.default = JSON.parse(JSON.stringify(i.defaultValue))));
  },
  Gi = (e, t, n, r) => {
    let i = e._zod.def;
    b(i.innerType, t, r);
    let a = t.seen.get(e);
    ((a.ref = i.innerType),
      t.io === `input` && (n._prefault = JSON.parse(JSON.stringify(i.defaultValue))));
  },
  Ki = (e, t, n, r) => {
    let i = e._zod.def;
    b(i.innerType, t, r);
    let a = t.seen.get(e);
    a.ref = i.innerType;
    let o;
    try {
      o = i.catchValue(void 0);
    } catch {
      throw Error(`Dynamic catch values are not supported in JSON Schema`);
    }
    n.default = o;
  },
  qi = (e, t, n, r) => {
    let i = e._zod.def,
      a = t.io === `input` ? (i.in._zod.def.type === `transform` ? i.out : i.in) : i.out;
    b(a, t, r);
    let o = t.seen.get(e);
    o.ref = a;
  },
  Ji = (e, t, n, r) => {
    let i = e._zod.def;
    b(i.innerType, t, r);
    let a = t.seen.get(e);
    ((a.ref = i.innerType), (n.readOnly = !0));
  },
  Yi = (e, t, n, r) => {
    let i = e._zod.def;
    b(i.innerType, t, r);
    let a = t.seen.get(e);
    a.ref = i.innerType;
  },
  Xi = p(`ZodISODateTime`, (e, t) => {
    (fn.init(e, t), T.init(e, t));
  });
function Zi(e) {
  return Br(Xi, e);
}
var Qi = p(`ZodISODate`, (e, t) => {
  (pn.init(e, t), T.init(e, t));
});
function $i(e) {
  return Vr(Qi, e);
}
var ea = p(`ZodISOTime`, (e, t) => {
  (mn.init(e, t), T.init(e, t));
});
function ta(e) {
  return Hr(ea, e);
}
var na = p(`ZodISODuration`, (e, t) => {
  (hn.init(e, t), T.init(e, t));
});
function ra(e) {
  return Ur(na, e);
}
var ia = (e, t) => {
  (Be.init(e, t),
    (e.name = `ZodError`),
    Object.defineProperties(e, {
      format: { value: (t) => Ue(e, t) },
      flatten: { value: (t) => He(e, t) },
      addIssue: {
        value: (t) => {
          (e.issues.push(t), (e.message = JSON.stringify(e.issues, se, 2)));
        },
      },
      addIssues: {
        value: (t) => {
          (e.issues.push(...t), (e.message = JSON.stringify(e.issues, se, 2)));
        },
      },
      isEmpty: {
        get() {
          return e.issues.length === 0;
        },
      },
    }));
};
p(`ZodError`, ia);
var S = p(`ZodError`, ia, { Parent: Error }),
  aa = We(S),
  oa = Ge(S),
  sa = Ke(S),
  ca = Je(S),
  la = Xe(S),
  ua = Ze(S),
  da = Qe(S),
  fa = $e(S),
  pa = et(S),
  ma = tt(S),
  ha = nt(S),
  ga = rt(S),
  C = p(
    `ZodType`,
    (e, t) => (
      v.init(e, t),
      Object.assign(e[`~standard`], {
        jsonSchema: { input: Ti(e, `input`), output: Ti(e, `output`) },
      }),
      (e.toJSONSchema = wi(e, {})),
      (e.def = t),
      (e.type = t.type),
      Object.defineProperty(e, `_def`, { value: t }),
      (e.check = (...n) =>
        e.clone(
          me(t, {
            checks: [
              ...(t.checks ?? []),
              ...n.map((e) =>
                typeof e == `function`
                  ? { _zod: { check: e, def: { check: `custom` }, onattach: [] } }
                  : e,
              ),
            ],
          }),
          { parent: !0 },
        )),
      (e.with = e.check),
      (e.clone = (t, n) => h(e, t, n)),
      (e.brand = () => e),
      (e.register = (t, n) => (t.add(e, n), e)),
      (e.parse = (t, n) => aa(e, t, n, { callee: e.parse })),
      (e.safeParse = (t, n) => sa(e, t, n)),
      (e.parseAsync = async (t, n) => oa(e, t, n, { callee: e.parseAsync })),
      (e.safeParseAsync = async (t, n) => ca(e, t, n)),
      (e.spa = e.safeParseAsync),
      (e.encode = (t, n) => la(e, t, n)),
      (e.decode = (t, n) => ua(e, t, n)),
      (e.encodeAsync = async (t, n) => da(e, t, n)),
      (e.decodeAsync = async (t, n) => fa(e, t, n)),
      (e.safeEncode = (t, n) => pa(e, t, n)),
      (e.safeDecode = (t, n) => ma(e, t, n)),
      (e.safeEncodeAsync = async (t, n) => ha(e, t, n)),
      (e.safeDecodeAsync = async (t, n) => ga(e, t, n)),
      (e.refine = (t, n) => e.check(Do(t, n))),
      (e.superRefine = (t) => e.check(Oo(t))),
      (e.overwrite = (t) => e.check(di(t))),
      (e.optional = () => co(e)),
      (e.exactOptional = () => uo(e)),
      (e.nullable = () => po(e)),
      (e.nullish = () => co(po(e))),
      (e.nonoptional = (t) => yo(e, t)),
      (e.array = () => k(e)),
      (e.or = (t) => j([e, t])),
      (e.and = (t) => eo(e, t)),
      (e.transform = (t) => Co(e, oo(t))),
      (e.default = (t) => ho(e, t)),
      (e.prefault = (t) => _o(e, t)),
      (e.catch = (t) => xo(e, t)),
      (e.pipe = (t) => Co(e, t)),
      (e.readonly = () => To(e)),
      (e.describe = (t) => {
        let n = e.clone();
        return (gr.add(n, { description: t }), n);
      }),
      Object.defineProperty(e, `description`, {
        get() {
          return gr.get(e)?.description;
        },
        configurable: !0,
      }),
      (e.meta = (...t) => {
        if (t.length === 0) return gr.get(e);
        let n = e.clone();
        return (gr.add(n, t[0]), n);
      }),
      (e.isOptional = () => e.safeParse(void 0).success),
      (e.isNullable = () => e.safeParse(null).success),
      (e.apply = (t) => t(e)),
      e
    ),
  ),
  _a = p(`_ZodString`, (e, t) => {
    ($t.init(e, t), C.init(e, t), (e._zod.processJSONSchema = (t, n, r) => Di(e, t, n, r)));
    let n = e._zod.bag;
    ((e.format = n.format ?? null),
      (e.minLength = n.minimum ?? null),
      (e.maxLength = n.maximum ?? null),
      (e.regex = (...t) => e.check(ai(...t))),
      (e.includes = (...t) => e.check(ci(...t))),
      (e.startsWith = (...t) => e.check(li(...t))),
      (e.endsWith = (...t) => e.check(ui(...t))),
      (e.min = (...t) => e.check(ri(...t))),
      (e.max = (...t) => e.check(ni(...t))),
      (e.length = (...t) => e.check(ii(...t))),
      (e.nonempty = (...t) => e.check(ri(1, ...t))),
      (e.lowercase = (t) => e.check(oi(t))),
      (e.uppercase = (t) => e.check(si(t))),
      (e.trim = () => e.check(pi())),
      (e.normalize = (...t) => e.check(fi(...t))),
      (e.toLowerCase = () => e.check(mi())),
      (e.toUpperCase = () => e.check(hi())),
      (e.slugify = () => e.check(gi())));
  }),
  va = p(`ZodString`, (e, t) => {
    ($t.init(e, t),
      _a.init(e, t),
      (e.email = (t) => e.check(vr(ya, t))),
      (e.url = (t) => e.check(wr(Sa, t))),
      (e.jwt = (t) => e.check(zr(La, t))),
      (e.emoji = (t) => e.check(Tr(Ca, t))),
      (e.guid = (t) => e.check(yr(ba, t))),
      (e.uuid = (t) => e.check(br(xa, t))),
      (e.uuidv4 = (t) => e.check(xr(xa, t))),
      (e.uuidv6 = (t) => e.check(Sr(xa, t))),
      (e.uuidv7 = (t) => e.check(Cr(xa, t))),
      (e.nanoid = (t) => e.check(Er(wa, t))),
      (e.guid = (t) => e.check(yr(ba, t))),
      (e.cuid = (t) => e.check(Dr(Ta, t))),
      (e.cuid2 = (t) => e.check(Or(Ea, t))),
      (e.ulid = (t) => e.check(kr(Da, t))),
      (e.base64 = (t) => e.check(Ir(Pa, t))),
      (e.base64url = (t) => e.check(Lr(Fa, t))),
      (e.xid = (t) => e.check(Ar(Oa, t))),
      (e.ksuid = (t) => e.check(jr(ka, t))),
      (e.ipv4 = (t) => e.check(Mr(Aa, t))),
      (e.ipv6 = (t) => e.check(Nr(ja, t))),
      (e.cidrv4 = (t) => e.check(Pr(Ma, t))),
      (e.cidrv6 = (t) => e.check(Fr(Na, t))),
      (e.e164 = (t) => e.check(Rr(Ia, t))),
      (e.datetime = (t) => e.check(Zi(t))),
      (e.date = (t) => e.check($i(t))),
      (e.time = (t) => e.check(ta(t))),
      (e.duration = (t) => e.check(ra(t))));
  });
function w(e) {
  return _r(va, e);
}
var T = p(`ZodStringFormat`, (e, t) => {
    (y.init(e, t), _a.init(e, t));
  }),
  ya = p(`ZodEmail`, (e, t) => {
    (nn.init(e, t), T.init(e, t));
  }),
  ba = p(`ZodGUID`, (e, t) => {
    (en.init(e, t), T.init(e, t));
  }),
  xa = p(`ZodUUID`, (e, t) => {
    (tn.init(e, t), T.init(e, t));
  }),
  Sa = p(`ZodURL`, (e, t) => {
    (rn.init(e, t), T.init(e, t));
  }),
  Ca = p(`ZodEmoji`, (e, t) => {
    (an.init(e, t), T.init(e, t));
  }),
  wa = p(`ZodNanoID`, (e, t) => {
    (on.init(e, t), T.init(e, t));
  }),
  Ta = p(`ZodCUID`, (e, t) => {
    (sn.init(e, t), T.init(e, t));
  }),
  Ea = p(`ZodCUID2`, (e, t) => {
    (cn.init(e, t), T.init(e, t));
  }),
  Da = p(`ZodULID`, (e, t) => {
    (ln.init(e, t), T.init(e, t));
  }),
  Oa = p(`ZodXID`, (e, t) => {
    (un.init(e, t), T.init(e, t));
  }),
  ka = p(`ZodKSUID`, (e, t) => {
    (dn.init(e, t), T.init(e, t));
  }),
  Aa = p(`ZodIPv4`, (e, t) => {
    (gn.init(e, t), T.init(e, t));
  }),
  ja = p(`ZodIPv6`, (e, t) => {
    (_n.init(e, t), T.init(e, t));
  }),
  Ma = p(`ZodCIDRv4`, (e, t) => {
    (vn.init(e, t), T.init(e, t));
  }),
  Na = p(`ZodCIDRv6`, (e, t) => {
    (yn.init(e, t), T.init(e, t));
  }),
  Pa = p(`ZodBase64`, (e, t) => {
    (xn.init(e, t), T.init(e, t));
  }),
  Fa = p(`ZodBase64URL`, (e, t) => {
    (Cn.init(e, t), T.init(e, t));
  }),
  Ia = p(`ZodE164`, (e, t) => {
    (wn.init(e, t), T.init(e, t));
  }),
  La = p(`ZodJWT`, (e, t) => {
    (En.init(e, t), T.init(e, t));
  }),
  Ra = p(`ZodNumber`, (e, t) => {
    (Dn.init(e, t),
      C.init(e, t),
      (e._zod.processJSONSchema = (t, n, r) => Oi(e, t, n, r)),
      (e.gt = (t, n) => e.check($r(t, n))),
      (e.gte = (t, n) => e.check(ei(t, n))),
      (e.min = (t, n) => e.check(ei(t, n))),
      (e.lt = (t, n) => e.check(Zr(t, n))),
      (e.lte = (t, n) => e.check(Qr(t, n))),
      (e.max = (t, n) => e.check(Qr(t, n))),
      (e.int = (t) => e.check(Ba(t))),
      (e.safe = (t) => e.check(Ba(t))),
      (e.positive = (t) => e.check($r(0, t))),
      (e.nonnegative = (t) => e.check(ei(0, t))),
      (e.negative = (t) => e.check(Zr(0, t))),
      (e.nonpositive = (t) => e.check(Qr(0, t))),
      (e.multipleOf = (t, n) => e.check(ti(t, n))),
      (e.step = (t, n) => e.check(ti(t, n))),
      (e.finite = () => e));
    let n = e._zod.bag;
    ((e.minValue = Math.max(n.minimum ?? -1 / 0, n.exclusiveMinimum ?? -1 / 0) ?? null),
      (e.maxValue = Math.min(n.maximum ?? 1 / 0, n.exclusiveMaximum ?? 1 / 0) ?? null),
      (e.isInt = (n.format ?? ``).includes(`int`) || Number.isSafeInteger(n.multipleOf ?? 0.5)),
      (e.isFinite = !0),
      (e.format = n.format ?? null));
  });
function E(e) {
  return Wr(Ra, e);
}
var za = p(`ZodNumberFormat`, (e, t) => {
  (On.init(e, t), Ra.init(e, t));
});
function Ba(e) {
  return Gr(za, e);
}
var Va = p(`ZodBoolean`, (e, t) => {
  (kn.init(e, t), C.init(e, t), (e._zod.processJSONSchema = (t, n, r) => ki(e, t, n, r)));
});
function D(e) {
  return Kr(Va, e);
}
var Ha = p(`ZodUndefined`, (e, t) => {
  (An.init(e, t), C.init(e, t), (e._zod.processJSONSchema = (t, n, r) => Ai(e, t, n, r)));
});
function Ua(e) {
  return qr(Ha, e);
}
var Wa = p(`ZodUnknown`, (e, t) => {
  (jn.init(e, t), C.init(e, t), (e._zod.processJSONSchema = (e, t, n) => void 0));
});
function O() {
  return Jr(Wa);
}
var Ga = p(`ZodNever`, (e, t) => {
  (Mn.init(e, t), C.init(e, t), (e._zod.processJSONSchema = (t, n, r) => ji(e, t, n, r)));
});
function Ka(e) {
  return Yr(Ga, e);
}
var qa = p(`ZodDate`, (e, t) => {
  (Nn.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Mi(e, t, n, r)),
    (e.min = (t, n) => e.check(ei(t, n))),
    (e.max = (t, n) => e.check(Qr(t, n))));
  let n = e._zod.bag;
  ((e.minDate = n.minimum ? new Date(n.minimum) : null),
    (e.maxDate = n.maximum ? new Date(n.maximum) : null));
});
function Ja(e) {
  return Xr(qa, e);
}
var Ya = p(`ZodArray`, (e, t) => {
  (Fn.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Li(e, t, n, r)),
    (e.element = t.element),
    (e.min = (t, n) => e.check(ri(t, n))),
    (e.nonempty = (t) => e.check(ri(1, t))),
    (e.max = (t, n) => e.check(ni(t, n))),
    (e.length = (t, n) => e.check(ii(t, n))),
    (e.unwrap = () => e.element));
});
function k(e, t) {
  return _i(Ya, e, t);
}
var Xa = p(`ZodObject`, (e, t) => {
  (Bn.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Ri(e, t, n, r)),
    m(e, `shape`, () => t.shape),
    (e.keyof = () => P(Object.keys(e._zod.def.shape))),
    (e.catchall = (t) => e.clone({ ...e._zod.def, catchall: t })),
    (e.passthrough = () => e.clone({ ...e._zod.def, catchall: O() })),
    (e.loose = () => e.clone({ ...e._zod.def, catchall: O() })),
    (e.strict = () => e.clone({ ...e._zod.def, catchall: Ka() })),
    (e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 })),
    (e.extend = (t) => Oe(e, t)),
    (e.safeExtend = (t) => ke(e, t)),
    (e.merge = (t) => Ae(e, t)),
    (e.pick = (t) => Ee(e, t)),
    (e.omit = (t) => De(e, t)),
    (e.partial = (...t) => je(so, e, t[0])),
    (e.required = (...t) => Me(vo, e, t[0])));
});
function A(e, t) {
  return new Xa({ type: `object`, shape: e ?? {}, ...g(t) });
}
var Za = p(`ZodUnion`, (e, t) => {
  (Hn.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => zi(e, t, n, r)),
    (e.options = t.options));
});
function j(e, t) {
  return new Za({ type: `union`, options: e, ...g(t) });
}
var Qa = p(`ZodDiscriminatedUnion`, (e, t) => {
  (Za.init(e, t), Un.init(e, t));
});
function M(e, t, n) {
  return new Qa({ type: `union`, options: t, discriminator: e, ...g(n) });
}
var $a = p(`ZodIntersection`, (e, t) => {
  (Wn.init(e, t), C.init(e, t), (e._zod.processJSONSchema = (t, n, r) => Bi(e, t, n, r)));
});
function eo(e, t) {
  return new $a({ type: `intersection`, left: e, right: t });
}
var to = p(`ZodRecord`, (e, t) => {
  (qn.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Vi(e, t, n, r)),
    (e.keyType = t.keyType),
    (e.valueType = t.valueType));
});
function N(e, t, n) {
  return new to({ type: `record`, keyType: e, valueType: t, ...g(n) });
}
function no(e, t, n) {
  let r = h(e);
  return ((r._zod.values = void 0), new to({ type: `record`, keyType: r, valueType: t, ...g(n) }));
}
var ro = p(`ZodEnum`, (e, t) => {
  (Jn.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Ni(e, t, n, r)),
    (e.enum = t.entries),
    (e.options = Object.values(t.entries)));
  let n = new Set(Object.keys(t.entries));
  ((e.extract = (e, r) => {
    let i = {};
    for (let r of e)
      if (n.has(r)) i[r] = t.entries[r];
      else throw Error(`Key ${r} not found in enum`);
    return new ro({ ...t, checks: [], ...g(r), entries: i });
  }),
    (e.exclude = (e, r) => {
      let i = { ...t.entries };
      for (let t of e)
        if (n.has(t)) delete i[t];
        else throw Error(`Key ${t} not found in enum`);
      return new ro({ ...t, checks: [], ...g(r), entries: i });
    }));
});
function P(e, t) {
  return new ro({
    type: `enum`,
    entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
    ...g(t),
  });
}
var io = p(`ZodLiteral`, (e, t) => {
  (Yn.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Pi(e, t, n, r)),
    (e.values = new Set(t.values)),
    Object.defineProperty(e, `value`, {
      get() {
        if (t.values.length > 1)
          throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
        return t.values[0];
      },
    }));
});
function F(e, t) {
  return new io({ type: `literal`, values: Array.isArray(e) ? e : [e], ...g(t) });
}
var ao = p(`ZodTransform`, (e, t) => {
  (Xn.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Ii(e, t, n, r)),
    (e._zod.parse = (n, r) => {
      if (r.direction === `backward`) throw new re(e.constructor.name);
      n.addIssue = (r) => {
        if (typeof r == `string`) n.issues.push(Re(r, n.value, t));
        else {
          let t = r;
          (t.fatal && (t.continue = !1),
            (t.code ??= `custom`),
            (t.input ??= n.value),
            (t.inst ??= e),
            n.issues.push(Re(t)));
        }
      };
      let i = t.transform(n.value, n);
      return i instanceof Promise ? i.then((e) => ((n.value = e), n)) : ((n.value = i), n);
    }));
});
function oo(e) {
  return new ao({ type: `transform`, transform: e });
}
var so = p(`ZodOptional`, (e, t) => {
  (Qn.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Yi(e, t, n, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function co(e) {
  return new so({ type: `optional`, innerType: e });
}
var lo = p(`ZodExactOptional`, (e, t) => {
  ($n.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Yi(e, t, n, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function uo(e) {
  return new lo({ type: `optional`, innerType: e });
}
var fo = p(`ZodNullable`, (e, t) => {
  (er.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Hi(e, t, n, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function po(e) {
  return new fo({ type: `nullable`, innerType: e });
}
var mo = p(`ZodDefault`, (e, t) => {
  (tr.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Wi(e, t, n, r)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeDefault = e.unwrap));
});
function ho(e, t) {
  return new mo({
    type: `default`,
    innerType: e,
    get defaultValue() {
      return typeof t == `function` ? t() : xe(t);
    },
  });
}
var go = p(`ZodPrefault`, (e, t) => {
  (rr.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Gi(e, t, n, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function _o(e, t) {
  return new go({
    type: `prefault`,
    innerType: e,
    get defaultValue() {
      return typeof t == `function` ? t() : xe(t);
    },
  });
}
var vo = p(`ZodNonOptional`, (e, t) => {
  (ir.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Ui(e, t, n, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function yo(e, t) {
  return new vo({ type: `nonoptional`, innerType: e, ...g(t) });
}
var bo = p(`ZodCatch`, (e, t) => {
  (or.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Ki(e, t, n, r)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeCatch = e.unwrap));
});
function xo(e, t) {
  return new bo({ type: `catch`, innerType: e, catchValue: typeof t == `function` ? t : () => t });
}
var So = p(`ZodPipe`, (e, t) => {
  (sr.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => qi(e, t, n, r)),
    (e.in = t.in),
    (e.out = t.out));
});
function Co(e, t) {
  return new So({ type: `pipe`, in: e, out: t });
}
var wo = p(`ZodReadonly`, (e, t) => {
  (lr.init(e, t),
    C.init(e, t),
    (e._zod.processJSONSchema = (t, n, r) => Ji(e, t, n, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function To(e) {
  return new wo({ type: `readonly`, innerType: e });
}
var Eo = p(`ZodCustom`, (e, t) => {
  (dr.init(e, t), C.init(e, t), (e._zod.processJSONSchema = (t, n, r) => Fi(e, t, n, r)));
});
function Do(e, t = {}) {
  return vi(Eo, e, t);
}
function Oo(e) {
  return yi(e);
}
function ko(e, t) {
  return Co(oo(e), t);
}
var Ao = {
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
    custom: `custom`,
  },
  jo;
(function (e) {})((jo ||= {}));
var Mo = { minWidth: 320, maxWidth: 3840, minHeight: 320, maxHeight: 2160 },
  No = A({ width: E().int().positive(), height: E().int().positive() }).strict(),
  Po = No.extend({
    width: E().int().min(Mo.minWidth).max(Mo.maxWidth),
    height: E().int().min(Mo.minHeight).max(Mo.maxHeight),
  });
P(
  `navigate.back.forward.reload.snapshot.click.fill.type.press.cuaKeypress.scroll.cuaScroll.domCuaScroll.hover.select.check.drag.cuaDrag.screenshot.getState.elementInfo.evaluate.getDialog.handleDialog.waitFor.playwright.playwrightWaitForTimeout.capabilities.browserVisibilityGet.browserVisibilitySet.browserViewportSet.browserViewportReset.activateTab.newTab.finalize.finalizeTabs.listUserTabs.claimTab.markDeliverable.markHandoff.nameSession.turnEnded.closeSession.cancelRequest.close.list`.split(
    `.`,
  ),
);
var Fo = P([`desktop-continuous`, `web-remote-replayable`]);
A({
  workspaceKey: w().min(1),
  sessionId: w().min(1),
  tabId: w().min(1).optional(),
  requestId: w().min(1),
  clientMode: Fo,
}).strict();
var Io = P([
    `backend_unavailable`,
    `capability_unsupported`,
    `duplicate_request_id`,
    `ref_not_found`,
    `navigation_blocked`,
    `timeout`,
    `renderer_unreachable`,
    `cancelled`,
    `execution_error`,
  ]),
  Lo = A({
    url: w(),
    title: w(),
    canGoBack: D(),
    canGoForward: D(),
    scrollX: E().optional(),
    scrollY: E().optional(),
    viewportWidth: E().optional(),
    viewportHeight: E().optional(),
  }).strict(),
  Ro = P([`left`, `right`, `middle`]),
  zo = P([`Alt`, `Control`, `ControlOrMeta`, `Meta`, `Shift`]),
  Bo = A({ x: E(), y: E() }).strict(),
  Vo = P([
    `allTextContents`,
    `click`,
    `count`,
    `dblclick`,
    `downloadMedia`,
    `evaluate`,
    `fill`,
    `getAttribute`,
    `innerText`,
    `isEnabled`,
    `isVisible`,
    `press`,
    `selectOption`,
    `setChecked`,
    `textContent`,
    `waitFor`,
  ]),
  Ho = P([`Alt`, `Control`, `ControlOrMeta`, `Meta`, `Shift`]),
  Uo = E().int().positive().optional(),
  Wo = A({
    value: w().optional(),
    label: w().optional(),
    index: E().int().nonnegative().optional(),
  })
    .strict()
    .refine(
      (e) => e.value !== void 0 || e.label !== void 0 || e.index !== void 0,
      `Select option requires value, label, or index`,
    ),
  Go = M(`name`, [
    A({ name: F(`domSnapshot`) }).strict(),
    A({ name: F(`elementInfo`), x: E(), y: E(), includeNonInteractable: D().optional() }).strict(),
    A({
      name: F(`elementScreenshot`),
      x: E(),
      y: E(),
      includeNonInteractable: D().optional(),
    }).strict(),
    A({
      name: F(`evaluate`),
      expression: w().min(1),
      expressionKind: P([`string`, `function`]),
      arg: O().optional(),
      timeoutMs: Uo,
    }).strict(),
    A({
      name: F(`waitForLoadState`),
      state: P([`load`, `domcontentloaded`, `networkidle`]).optional(),
      timeoutMs: Uo,
    }).strict(),
    A({
      name: F(`waitForURL`),
      url: w().min(1),
      waitUntil: P([`load`, `domcontentloaded`, `networkidle`, `commit`]).optional(),
      timeoutMs: Uo,
    }).strict(),
    A({ name: F(`waitForEvent`), event: P([`download`, `filechooser`]), timeoutMs: Uo }).strict(),
    A({ name: F(`downloadPath`), downloadId: w().min(1), timeoutMs: Uo }).strict(),
    A({
      name: F(`fileChooserSetFiles`),
      fileChooserId: w().min(1),
      files: k(w()).min(1),
      timeoutMs: Uo,
    }).strict(),
    A({
      name: F(`locator`),
      selector: w().min(1),
      operation: Vo,
      value: O().optional(),
      arg: O().optional(),
      expression: w().min(1).optional(),
      expressionKind: P([`string`, `function`]).optional(),
      attribute: w().min(1).optional(),
      checked: D().optional(),
      replace: D().optional(),
      force: D().optional(),
      button: Ro.optional(),
      modifiers: k(Ho).optional(),
      state: P([`attached`, `detached`, `visible`, `hidden`]).optional(),
      selections: k(Wo).min(1).optional(),
      timeoutMs: Uo,
    }).strict(),
  ]),
  Ko = M(`method`, [
    A({ method: F(`navigate`), url: w().min(1), tabId: w().optional() }).strict(),
    A({ method: F(`back`), tabId: w().optional() }).strict(),
    A({ method: F(`forward`), tabId: w().optional() }).strict(),
    A({ method: F(`reload`), tabId: w().optional() }).strict(),
    A({
      method: F(`snapshot`),
      maxElements: E().int().positive().optional(),
      includeHidden: D().optional(),
      tabId: w().optional(),
    }).strict(),
    A({
      method: F(`click`),
      ref: w().min(1).optional(),
      x: E().optional(),
      y: E().optional(),
      button: Ro.optional(),
      doubleClick: D().optional(),
      modifiers: k(zo).optional(),
      tabId: w().optional(),
    }).strict(),
    A({ method: F(`fill`), ref: w().min(1), value: w(), tabId: w().optional() }).strict(),
    A({ method: F(`type`), ref: w().min(1).optional(), text: w(), tabId: w().optional() }).strict(),
    A({
      method: F(`press`),
      key: w().min(1),
      ref: w().min(1).optional(),
      modifiers: k(zo).optional(),
      tabId: w().optional(),
    }).strict(),
    A({ method: F(`cuaKeypress`), keys: k(w().min(1)).min(1), tabId: w().optional() }).strict(),
    A({
      method: F(`scroll`),
      ref: w().min(1).optional(),
      x: E().optional(),
      y: E().optional(),
      tabId: w().optional(),
    }).strict(),
    A({
      method: F(`cuaScroll`),
      x: E(),
      y: E(),
      scrollX: E(),
      scrollY: E(),
      modifiers: k(zo).optional(),
      tabId: w().optional(),
    }).strict(),
    A({
      method: F(`domCuaScroll`),
      nodeId: w().min(1).optional(),
      scrollX: E(),
      scrollY: E(),
      tabId: w().optional(),
    }).strict(),
    A({
      method: F(`screenshot`),
      ref: w().min(1).optional(),
      fullPage: D().optional(),
      clip: A({ x: E(), y: E(), width: E().positive(), height: E().positive() })
        .strict()
        .optional(),
      tabId: w().optional(),
    }).strict(),
    A({ method: F(`getState`), tabId: w().optional() }).strict(),
    A({
      method: F(`hover`),
      ref: w().min(1).optional(),
      x: E().optional(),
      y: E().optional(),
      modifiers: k(zo).optional(),
      tabId: w().optional(),
    }).strict(),
    A({
      method: F(`select`),
      ref: w().min(1),
      values: k(w()).min(1),
      tabId: w().optional(),
    }).strict(),
    A({
      method: F(`check`),
      ref: w().min(1),
      checked: D().optional(),
      tabId: w().optional(),
    }).strict(),
    A({
      method: F(`drag`),
      fromRef: w().min(1).optional(),
      toRef: w().min(1).optional(),
      from: Bo.optional(),
      to: Bo.optional(),
      modifiers: k(zo).optional(),
      tabId: w().optional(),
    }).strict(),
    A({
      method: F(`cuaDrag`),
      path: k(Bo).min(1),
      modifiers: k(zo).optional(),
      tabId: w().optional(),
    }).strict(),
    A({ method: F(`elementInfo`), x: E(), y: E(), tabId: w().optional() }).strict(),
    A({ method: F(`evaluate`), expression: w().min(1), tabId: w().optional() }).strict(),
    A({ method: F(`getDialog`), tabId: w().optional() }).strict(),
    A({
      method: F(`handleDialog`),
      accept: D(),
      promptText: w().optional(),
      tabId: w().optional(),
    }).strict(),
    A({
      method: F(`waitFor`),
      selector: w().min(1).optional(),
      text: w().min(1).optional(),
      textGone: w().min(1).optional(),
      timeoutMs: E().int().positive().optional(),
      tabId: w().optional(),
    }).strict(),
    A({
      method: F(`playwrightWaitForTimeout`),
      timeoutMs: E().int().nonnegative(),
      tabId: w().optional(),
    }).strict(),
    A({ method: F(`playwright`), action: Go, tabId: w().optional() }).strict(),
    A({ method: F(`capabilities`), tabId: w().optional() }).strict(),
    A({ method: F(`browserVisibilityGet`) }).strict(),
    A({ method: F(`browserVisibilitySet`), visible: D() }).strict(),
    Po.extend({ method: F(`browserViewportSet`), tabId: w().optional() }).strict(),
    A({ method: F(`browserViewportReset`), tabId: w().optional() }).strict(),
    A({ method: F(`activateTab`), tabId: w().min(1) }).strict(),
    A({ method: F(`newTab`) }).strict(),
    A({ method: F(`listUserTabs`) }).strict(),
    A({ method: F(`claimTab`), tabId: w().min(1) }).strict(),
    A({
      method: F(`finalizeTabs`),
      keep: k(A({ tabId: w().min(1), status: P([`handoff`, `deliverable`]) }).strict()),
    }).strict(),
    A({ method: F(`markDeliverable`), tabId: w().min(1) }).strict(),
    A({ method: F(`markHandoff`), tabId: w().min(1) }).strict(),
    A({ method: F(`nameSession`), name: w().trim().min(1) }).strict(),
    A({ method: F(`finalize`), tabId: w().optional(), deliverable: D().optional() }).strict(),
    A({ method: F(`turnEnded`), turnId: w().min(1).optional() }).strict(),
    A({ method: F(`closeSession`) }).strict(),
    A({ method: F(`cancelRequest`), requestId: w().min(1) }).strict(),
    A({ method: F(`close`), tabId: w().optional() }).strict(),
    A({ method: F(`list`) }).strict(),
  ]),
  qo = P([`iab`, `extension`, `cdp`]),
  Jo = A({ id: w().trim().min(1), description: w().trim().min(1) }).strict(),
  Yo = A({
    id: w().trim().min(1),
    generation: E().int().nonnegative().default(0),
    type: qo,
    name: w().trim().min(1),
    capabilities: A({ browser: k(Jo).optional(), tab: k(Jo).optional() }).strict(),
    apiSupportOverrides: N(w(), D()).optional(),
    metadata: N(w(), w()).optional(),
  }).strict(),
  Xo = P([`live`, `cached`]);
(A({
  requestId: w().trim().min(1),
  workspaceKey: w().trim().min(1),
  workspacePath: w().trim().min(1),
  workspaceIdentity: w().trim().min(1).optional(),
  remoteSessionId: w().trim().min(1).optional(),
  sessionId: w().trim().min(1),
  turnId: w().trim().min(1).optional(),
  clientMode: Fo,
  sessionContext: Xo,
})
  .strict()
  .extend({ browserId: w().trim().min(1), browserGeneration: E().int().nonnegative() })
  .strict(),
  A({ browsers: k(Yo) }).strict());
var Zo = A({ x: E(), y: E(), width: E(), height: E() }).strict(),
  Qo = A({
    ref: w().min(1),
    tag: w(),
    role: w().optional(),
    name: w().optional(),
    text: w().optional(),
    value: w().optional(),
    disabled: D().optional(),
    checked: D().optional(),
    selector: w(),
    xpath: w(),
    rect: Zo,
    inViewport: D(),
    parentRef: w().optional(),
    framePath: w().optional(),
    attributes: N(w(), w()).optional(),
  }).strict(),
  $o = A({
    tag: w(),
    depth: E().int().nonnegative(),
    inViewport: D(),
    ref: w().min(1).optional(),
    role: w().optional(),
    name: w().optional(),
    text: w().optional(),
    attributes: N(w(), w()).optional(),
  }).strict(),
  es = A({
    url: w(),
    title: w(),
    dom: k($o).optional(),
    domTruncated: D().optional(),
    elements: k(Qo),
    truncated: D(),
  }).strict(),
  ts = A({
    tabId: w(),
    url: w(),
    title: w(),
    viewport: No,
    active: D().optional(),
    lifecycle: P([`active`, `deliverable`, `handoff`]).optional(),
  }).strict(),
  ns = A({
    id: w().min(1),
    lastOpened: w().optional(),
    tabGroup: w().optional(),
    title: w().optional(),
    url: w().optional(),
  }).strict(),
  rs = A({
    type: P([`alert`, `confirm`, `prompt`, `beforeunload`]),
    message: w(),
    defaultPrompt: w().optional(),
  }).strict(),
  is = A({
    browserUse: F(!0),
    backendType: qo,
    browserId: w().min(1),
    browserGeneration: E().int().nonnegative(),
    openTabIds: k(w()),
    tabId: w().optional(),
    currentUrl: w().optional(),
    lifecycle: P([`active`, `deliverable`, `handoff`, `closed`]).optional(),
  }).strict(),
  as = A({
    ok: D(),
    state: Lo.optional(),
    snapshot: es.optional(),
    image: A({ base64: w(), mimeType: F(`image/png`) })
      .strict()
      .optional(),
    tabs: k(ts).optional(),
    userTabs: k(ns).optional(),
    tab: ts.optional(),
    value: O().optional(),
    element: Qo.optional(),
    dialog: rs.nullable().optional(),
    error: A({ code: Io, message: w(), sideEffect: P([`none`, `uncertain`]).optional() })
      .strict()
      .optional(),
    meta: is.optional(),
    elapsedMs: E().nonnegative(),
  }).strict(),
  os = [`local-download-upload`, `remote-download`],
  ss = `local-download-upload`,
  cs = [`server-bundle`, `node-runtime`, `node-pty`, `glm`, `bfs`, `ripgrep`, `ugrep`],
  ls = [`server-bundle`, `node-runtime`, `node-pty`, `glm`, `bfs`, `ripgrep`, `ugrep`],
  us = [`server-bundle`, `node-runtime`];
ls.filter((e) => !us.includes(e));
var ds = new Set(cs);
(new Set(ls), new Set(us));
function fs(e) {
  return [...ls];
}
function ps(e) {
  return ds.has(e);
}
var I = P([`claude`, `opencode`, `gemini`, `codex`, `glm`]),
  ms = [`7d`, `30d`],
  hs = A({ modelId: w().nullable(), totalTokens: E(), share: E() }),
  gs = A({
    totalTokens: E(),
    inputTokens: E(),
    outputTokens: E(),
    reasoningTokens: E(),
    cacheCreationTokens: E(),
    cacheReadTokens: E(),
    cacheHitRate: E(),
    totalSessions: E(),
    totalTurns: E(),
    toolCallCount: E(),
    toolErrorRate: E(),
    modelErrorRate: E(),
    avgTimeToFirstTokenMs: E().nullable(),
    avgTurnDurationMs: E().nullable(),
    activeDays: E(),
    currentStreakDays: E(),
    favoriteModel: hs.nullable(),
  }),
  _s = A({
    date: w(),
    level: j([F(0), F(1), F(2), F(3), F(4)]),
    totalTokens: E(),
    turnCount: E(),
    toolCallCount: E(),
  }),
  vs = A({ weekIndex: E(), days: k(_s.nullable()) }),
  ys = A({ startDate: w().nullable(), endDate: w().nullable(), maxTokens: E(), weeks: k(vs) }),
  bs = A({ modelId: w().nullable(), totalTokens: E() }),
  xs = A({ date: w(), models: k(bs) }),
  Ss = A({
    modelId: w().nullable(),
    totalTokens: E(),
    inputTokens: E(),
    outputTokens: E(),
    requestCount: E(),
    share: E(),
  }),
  Cs = A({
    toolName: w(),
    callCount: E(),
    errorCount: E(),
    errorRate: E(),
    avgDurationMs: E().nullable(),
  });
A({
  range: P(ms),
  generatedAt: E(),
  timeZone: w(),
  source: F(`agent-db`),
  summary: gs,
  heatmap: ys,
  dailyModelUsage: k(xs),
  models: k(Ss),
  tools: k(Cs),
});
var ws = `zcodeAgent`,
  Ts = [`glm`];
function Es(e) {
  return `glm`;
}
function Ds(e) {
  return e === `glm`;
}
var L = w().trim().min(1),
  R = N(w(), O()),
  z = E().int().nonnegative(),
  Os = P([`desktop-continuous`, `web-remote-replayable`]),
  ks = P([`user-visible`, `model-only`]),
  As = P([
    `background_task`,
    `fork`,
    `goal_state_change`,
    `goal-continuation`,
    `plugin_reference`,
    `rewind`,
    `selection_side_chat`,
    `subagent`,
    `subagent_message`,
    `todo_reminder`,
  ]),
  B = A({
    workspacePath: L,
    workspaceIdentity: L.optional(),
    remoteSessionId: L.optional(),
    workspaceKey: L,
  }).strict(),
  js = P([`allow`, `deny`, `escalate`, `modify`]),
  Ms = P([`allow`, `deny`, `ask`]),
  Ns = A({ toolName: L, ruleContent: w().optional() }).strict(),
  Ps = A({ type: F(`addRules`), behavior: Ms, rules: k(Ns).min(1) }).strict(),
  Fs = A({
    decision: js,
    reason: w().optional(),
    modifiedInput: O().optional(),
    permissionUpdates: k(Ps).optional(),
  }).strict(),
  V = A({ providerId: L, modelId: L, variant: L.optional() }).strict(),
  Is = P([`plan`, `build`, `edit`, `yolo`, `auto`]),
  Ls = P([`idle`, `running`, `waiting`, `paused`, `completed`, `error`]),
  Rs = P([
    `interactive`,
    `fork`,
    `selection_side_chat`,
    `workflow_parent`,
    `workflow_child`,
    `subagent_child`,
    `nested_workflow_child`,
  ]),
  zs = A({
    sessionId: L,
    targetId: L,
    objective: L,
    summaryTitle: w().min(1).nullable().default(null),
    status: P([`active`, `paused`, `budget_limited`, `complete`]),
    tokenBudget: E().int().positive().nullable(),
    tokensUsed: E().int().nonnegative(),
    timeUsedSeconds: E().int().nonnegative(),
    activeInputId: L.nullable().optional(),
    activeRunStartedAtMs: z.nullable().optional(),
    activeRunLastSeenAtMs: z.nullable().optional(),
    createdAt: z,
    updatedAt: z,
  }).strict(),
  Bs = A({ nextAction: w().nullable().optional(), passed: D(), reason: w() }).strict(),
  Vs = A({
    version: F(1),
    kind: F(`synthetic`),
    type: F(`goal_verification`),
    display: F(`separator`),
    targetId: L,
    verificationId: L,
    status: P([`started`, `completed`, `failed_closed`, `cancelled`]),
    verification: Bs.optional(),
    goalIteration: E().int().positive().optional(),
    anchorAssistantMessageId: L.optional(),
    anchorTurnId: L.optional(),
    startedAt: z.optional(),
    updatedAt: z,
  }).strict(),
  Hs = A({
    sessionId: L,
    workspace: B,
    parentSessionId: L.optional(),
    traceId: L.optional(),
    sessionKind: Rs,
    title: w(),
    titleSource: P([`default`, `first_input`, `generated`, `custom`]).optional(),
    mode: Is,
    status: Ls,
    model: V.optional(),
    target: zs.nullable().optional(),
    createdAt: z,
    updatedAt: z,
    archivedAt: z.optional(),
  }).strict(),
  Us = A({
    kind: F(`subagent`),
    agentId: L,
    agentType: L,
    childSessionId: L,
    childTurnId: L.optional(),
    description: w().optional(),
    parentSessionId: L,
    parentToolCallId: L.optional(),
    parentTurnId: L.optional(),
  }).strict(),
  Ws = A({ created: z, completed: z.optional() }).strict(),
  Gs = A({
    total: E().int().nonnegative().optional(),
    input: E().int().nonnegative(),
    output: E().int().nonnegative(),
    reasoning: E().int().nonnegative(),
    cache: A({ read: E().int().nonnegative(), write: E().int().nonnegative() }).strict(),
  }).strict(),
  Ks = A({
    origin: P([`real_user`, `agent_runtime`, `system`, `migration`]),
    kind: P([
      `user_prompt`,
      `slash_command`,
      `system_reminder`,
      `background_notification`,
      `subagent_notification`,
      `todo_reminder`,
      `rewind_notice`,
      `fork_notice`,
      `timeline_event`,
      `compact_summary`,
      `assistant_response`,
    ]),
    source: w().optional(),
    commandName: w().optional(),
    uiVisibility: P([`visible`, `hidden`, `debug`]),
    providerVisibility: P([`visible`, `hidden`]),
    transcriptVisibility: P([`visible`, `hidden`]),
  }).strict(),
  qs = M(`role`, [
    A({
      messageId: L,
      sessionId: L,
      role: F(`user`),
      time: Ws,
      agent: L,
      model: V,
      system: w().optional(),
      tools: N(w(), D()).optional(),
      synthetic: D().optional(),
      source: As.optional(),
      visibility: ks.optional(),
      semantics: Ks.optional(),
      metadata: R.optional(),
    }).strict(),
    A({
      messageId: L,
      sessionId: L,
      role: F(`assistant`),
      time: Ws,
      parentMessageId: L,
      agent: L,
      model: V,
      path: A({ cwd: L, root: L }).strict(),
      cost: E().nonnegative(),
      tokens: Gs,
      finish: w().optional(),
      error: R.optional(),
      semantics: Ks.optional(),
      structured: O().optional(),
    }).strict(),
  ]),
  H = A({ partId: L, sessionId: L, messageId: L }),
  Js = M(`status`, [
    A({ status: F(`pending`), input: R, raw: w() }).strict(),
    A({
      status: F(`running`),
      input: R,
      title: w().optional(),
      metadata: R.optional(),
      startedAt: z,
    }).strict(),
    A({
      status: F(`completed`),
      input: R,
      output: w(),
      title: w(),
      metadata: R,
      startedAt: z,
      completedAt: z,
    }).strict(),
    A({
      status: F(`error`),
      input: R,
      error: w(),
      metadata: R.optional(),
      startedAt: z,
      completedAt: z,
    }).strict(),
  ]),
  Ys = V.extend({ label: w().optional() }),
  Xs = A({ start: z.optional(), end: z.optional() }).strict(),
  Zs = H.extend({
    type: F(`timeline`),
    timelineType: P([`context_compaction`, `goal_verification`, `session_fork`, `model_change`]),
    display: P([`separator`, `worklog`]),
    status: w().optional(),
    anchorMessageId: L.optional(),
    anchorTurnId: L.optional(),
    time: Xs.optional(),
    operationId: w().optional(),
    trigger: P([`manual`, `auto`, `partial`, `reactive`, `session_memory`]).optional(),
    phase: P([`standalone_turn`, `pre_request`, `mid_turn`, `reactive`]).optional(),
    compactReason: w().optional(),
    boundaryId: w().optional(),
    summaryMessageId: L.optional(),
    preCompactTokenCount: E().int().nonnegative().optional(),
    postCompactTokenCount: E().int().nonnegative().optional(),
    truePostCompactTokenCount: E().int().nonnegative().optional(),
    attempt: E().int().nonnegative().optional(),
    maxAttempts: E().int().nonnegative().optional(),
    reason: w().optional(),
    targetId: w().optional(),
    verificationId: w().optional(),
    goalIteration: E().int().nonnegative().optional(),
    verification: A({ passed: D(), reason: w(), nextAction: w().nullable().optional() })
      .strict()
      .optional(),
    parentSessionId: L.optional(),
    targetMessageId: L.optional(),
    targetCheckpointId: w().optional(),
    restoredFileCount: E().int().nonnegative().optional(),
    fromModel: Ys.optional(),
    toModel: Ys.extend({ label: L }).optional(),
  }).strict(),
  Qs = M(`type`, [
    H.extend({
      type: F(`text`),
      text: w(),
      synthetic: D().optional(),
      ignored: D().optional(),
      metadata: R.optional(),
    }).strict(),
    H.extend({ type: F(`reasoning`), text: w(), metadata: R.optional() }).strict(),
    H.extend({
      type: F(`file`),
      mime: L,
      filename: w().optional(),
      url: L,
      metadata: R.optional(),
    }).strict(),
    H.extend({ type: F(`tool`), callId: L, tool: L, state: Js, metadata: R.optional() }).strict(),
    H.extend({ type: F(`step-start`), snapshot: w().optional() }).strict(),
    H.extend({
      type: F(`step-finish`),
      reason: w(),
      snapshot: w().optional(),
      cost: E().nonnegative(),
      tokens: Gs,
    }).strict(),
    H.extend({ type: F(`snapshot`), snapshot: w() }).strict(),
    H.extend({ type: F(`patch`), hash: L, files: k(w()) }).strict(),
    H.extend({
      type: F(`compaction`),
      auto: D(),
      reason: w().optional(),
      summaryMessageId: L.optional(),
      metadata: R.optional(),
    }).strict(),
    Zs,
    H.extend({
      type: F(`subagent`),
      prompt: w(),
      description: w(),
      agent: L,
      model: V.optional(),
      command: w().optional(),
    }).strict(),
    H.extend({ type: F(`agent`), name: L }).strict(),
    H.extend({ type: F(`retry`), attempt: E().int().nonnegative(), error: R }).strict(),
  ]),
  $s = A({ info: qs, parts: k(Qs) }).strict(),
  ec = A({
    kind: F(`api_retry`),
    attempt: E().int().positive(),
    maxRetries: E().int().nonnegative(),
    retryDelayMs: E().int().nonnegative(),
    errorStatus: E().int().nonnegative().nullable(),
    error: w(),
  }).strict(),
  tc = A({
    inputTokens: E().int().nonnegative(),
    cacheReadTokens: E().int().nonnegative(),
    cacheWriteTokens: E().int().nonnegative(),
    latestHitRate: E().nonnegative().nullable().optional(),
    hitRateRequestCount: E().int().nonnegative().optional(),
    totalInputTokens: E().int().nonnegative().optional(),
    totalCacheReadTokens: E().int().nonnegative().optional(),
    totalCacheWriteTokens: E().int().nonnegative().optional(),
    hitRate: E().nonnegative().nullable(),
  }).strict(),
  nc = k(
    A({
      source: P([
        `system_prompt`,
        `meta_user_context`,
        `skills`,
        `tool_prompt`,
        `system_tool_schemas`,
        `mcp_tool_schemas`,
        `messages`,
      ]),
      chars: E().int().nonnegative(),
    }).strict(),
  ),
  rc = A({
    used: E().int().nonnegative(),
    size: E().int().positive(),
    cost: A({ amount: E().nonnegative(), currency: L }).strict().nullable().optional(),
    cache: tc.optional(),
    breakdown: nc.optional(),
  }).strict(),
  ic = A({
    eventSeq: E().int().nonnegative(),
    stateRevision: E().int().nonnegative(),
    deliveryKind: Os.optional(),
    activeTurnId: L.optional(),
    activeTurnKind: P([`regular`, `compact`, `rewind`]).optional(),
    pendingRequestIds: k(L),
    apiRetry: ec.nullable().optional(),
    contextUsage: rc.optional(),
    goalVerifications: k(Bs).optional(),
    goalVerificationTimeline: k(Vs).optional(),
  }).strict();
function ac(e) {
  return e
    .filter((e) => e.type === `text`)
    .map((e) => e.text)
    .join(``);
}
var oc = [`telegram`, `webhook`, `feishu`, `lark`, `weixin`, `discord`, `wecom`],
  sc = A({
    provider: P([`feishu`, `lark`, `weixin`]),
    botId: w().trim().min(1),
    providerUserId: w().trim().min(1),
    chatType: P([`private`, `group`]),
  }).strict();
function cc(e) {
  return e === `feishu` || e === `lark`;
}
var lc = [`assistant_changes`, `assistant_toolcalls_changes`, `summary_changes`, `streaming_card`],
  uc = 3e4,
  dc = `bots:task`,
  fc = `bots:task-stream`,
  pc = A({
    status: D(),
    new: D(),
    workspace: D(),
    model: D(),
    mode: D().optional(),
    thoughtLevel: D(),
    sandboxMode: D().optional(),
    approvalPolicy: D().optional(),
    cli: D().optional(),
    reply: D(),
  }).strict(),
  mc = A({
    model: w().min(1).optional(),
    mode: w().min(1).optional(),
    thoughtLevel: w().min(1).optional(),
    sandboxMode: w().min(1).optional(),
    approvalPolicy: w().min(1).optional(),
    cli: P([`codex`, `claude`, `opencode`, `gemini`, `glm`]).optional(),
  }).strict(),
  hc = A({
    provider: P([`codex`, `claude`, `opencode`, `gemini`, `glm`]),
    model: w().min(1).optional(),
    mode: w().min(1).optional(),
    thoughtLevel: w().min(1).optional(),
  }).strict(),
  gc = A({ value: w(), label: w(), description: w().optional() }).strict(),
  _c = A({ question: w(), header: w(), options: k(gc), multiSelect: D().optional() }).strict(),
  vc = A({
    taskId: w().min(1),
    requestId: w().min(1),
    runId: w().min(1),
    origin: Us.optional(),
    actorKey: w().min(1).optional(),
    currentQuestionIndex: E().int().min(0),
    questions: k(_c),
    answers: N(w(), k(w())),
    renderContext: A({ kind: F(`plan_approval`), plan: w().min(1) })
      .strict()
      .optional(),
    expandedCustomAnswerQuestionIndexes: k(E().int().min(0)).optional(),
    handledAt: E().optional(),
  }).strict(),
  yc = A({
    id: w().min(1),
    name: w(),
    provider: P(oc),
    enabled: D(),
    credentialRef: w().min(1).optional(),
    webhookSecretRef: w().min(1).optional(),
    webhookUrl: w().url().optional(),
    webhookAuthHeaderName: w().min(1).optional(),
    feishuAppId: w().min(1).optional(),
    providerUserId: w().min(1).optional(),
    displayName: w().optional(),
    allowedWorkspaces: k(w().min(1)),
    allowedCommands: pc,
    currentOptions: mc,
    replyMode: P([
      `assistant_changes`,
      `assistant_toolcalls_changes`,
      `summary_changes`,
      `streaming_card`,
    ]),
  }).strict();
(A({ version: F(2), bots: k(yc) }).strict(),
  A({
    version: F(2),
    bots: N(
      w(),
      A({
        botId: w().min(1),
        workspacePath: w().min(1),
        workspaceIdentity: w().min(1).optional(),
        workspaceId: w().min(1).optional(),
        mode: P([`draft`, `task`]),
        activeTaskId: w().min(1).nullable(),
        draftOptions: hc.optional(),
        pendingPermissionOptions: k(
          A({
            requestId: w().min(1),
            optionId: w().min(1),
            command: P([`approve`, `deny`]),
            label: w().min(1),
            response: Fs,
            handledAt: E().optional(),
          }),
        ).optional(),
        pendingElicitation: vc.optional(),
        telegramOffset: E().optional(),
        weixinGetUpdatesBuf: w().optional(),
        weixinActivatedAt: E().optional(),
        updatedAt: E(),
      }),
    ),
  }).strict());
var bc = `assistant_changes`;
function xc(e) {
  return cc(e) ? [`streaming_card`] : lc.filter((e) => e !== `streaming_card`);
}
function Sc(e, t) {
  let n = xc(e),
    r = t ?? `assistant_changes`;
  return n.includes(r) ? r : n[0];
}
function Cc(e) {
  let t = e.trim();
  return (
    t.length > 0 &&
    t.length <= 64 &&
    !wc(t) &&
    !t.includes(`:`) &&
    !t.includes(`/`) &&
    !t.includes(`\\`)
  );
}
function wc(e) {
  for (let t of e) {
    let e = t.codePointAt(0) ?? 0;
    if (e < 32 || e === 127) return !0;
  }
  return !1;
}
var Tc = w()
    .trim()
    .max(64)
    .refine((e) => e.length === 0 || Cc(e), { message: `Invalid WSL user` }),
  Ec = `https://zcode.z.ai`,
  Dc = `https://zcode.chatglm.site`,
  Oc = `https://bigmodel.cn`,
  kc = `https://dev.bigmodel.cn`,
  Ac = `3.4.0`;
function jc(e) {
  if (!e) return !1;
  let t = e
    .trim()
    .replace(/^v/i, ``)
    .match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([^+]+))?(?:\+(.+))?$/);
  if (!t) return !1;
  let n = t[4]?.split(`.`),
    r =
      n === void 0 ||
      n.every((e) => /^[0-9A-Za-z-]+$/.test(e) && (!/^\d+$/.test(e) || /^(0|[1-9]\d*)$/.test(e))),
    i = t[5]?.split(`.`),
    a = i === void 0 || i.every((e) => /^[0-9A-Za-z-]+$/.test(e));
  if (!r || !a) return !1;
  let o = [Number(t[1]), Number(t[2]), Number(t[3])],
    s = Ac.split(`.`).map(Number);
  for (let e = 0; e < s.length; e += 1) if (o[e] !== s[e]) return o[e] > s[e];
  return n === void 0;
}
function Mc(e, t) {
  return e[t]?.trim() || void 0;
}
function Nc(e) {
  let t = e.trim();
  if (!t) throw Error(`ZCode endpoint origin is empty`);
  let n = new URL(t);
  if (n.protocol !== `https:` && n.protocol !== `http:`)
    throw Error(`ZCode endpoint origin must use http or https`);
  return n.origin;
}
function Pc(e) {
  let t = e?.env ?? `test`,
    n = e?.envBaseOrigin?.trim();
  if (t === `production`) return n ? Nc(n) : Ec;
  let r = e?.overrideOrigin?.trim();
  return r ? Nc(r) : n ? Nc(n) : Dc;
}
function Fc(e = {}) {
  return e.ZCODE_ENV?.trim().toLowerCase() === `test` ? `test` : `production`;
}
function Ic(e = {}, t) {
  let n = Fc(e),
    r = n === `production` ? Mc(e, `ZCODE_PRODUCTION_BASE_URL`) : Mc(e, `ZCODE_TEST_BASE_URL`);
  return Pc({
    env: n,
    envBaseOrigin: Mc(e, `ZCODE_BASE_URL`) ?? Mc(e, `ZCODE_ENDPOINT_ORIGIN`) ?? r,
    overrideOrigin: t?.overrideOrigin,
  });
}
function Lc(e = {}) {
  return Hc(Ic(e));
}
function Rc(e = {}) {
  let t = Fc(e),
    n =
      t === `production`
        ? Mc(e, `BIGMODEL_PRODUCTION_API_BASE_URL`)
        : Mc(e, `BIGMODEL_TEST_API_BASE_URL`),
    r = t === `production` ? Oc : kc;
  return Nc(Mc(e, `BIGMODEL_API_BASE_URL`) ?? n ?? r);
}
function zc(e = {}, t) {
  let n = t.startsWith(`/`) ? t : `/${t}`;
  return `${Rc(e)}${n}`;
}
function Bc(e = {}) {
  return zc(e, `/coding-plan/personal/overview`);
}
function Vc(e = {}) {
  return zc(e, `/coding-plan/team/plans`);
}
function Hc(e, t = {}) {
  let n = Nc(e),
    r = new URL(n),
    i = `${r.protocol === `https:` ? `wss:` : `ws:`}//${r.host}`,
    a = jc(t.appVersion) ? `v4` : `v3`;
  return {
    origin: n,
    apiBaseUrl: `${n}/api/v1`,
    remoteUrl: `${n}/remote/${a}`,
    webRemoteCallbackUrl: `${n}/web-remote/callback`,
    relayWsUrl: `${i}/ws`,
    zcodePlanOpenAiBaseUrl: `${n}/api/v1/zcode-plan`,
    zcodePlanAnthropicBaseUrl: `${n}/api/v1/zcode-plan/anthropic`,
    zcodePlanBillingCurrentUrl: `${n}/api/v1/zcode-plan/billing/current`,
    zcodePlanBillingBalanceUrl: `${n}/api/v1/zcode-plan/billing/balance`,
  };
}
var U = w().trim().min(1),
  Uc = P([`zh-CN`, `en-US`]),
  Wc = P([`system`, `zh-CN`, `en-US`]),
  Gc = P([`queue`, `guide`]),
  Kc = P([`stable`, `preview`]),
  qc = E().int().min(-3).max(5),
  Jc = M(`mode`, [
    A({ mode: F(`auto`) }),
    A({ mode: F(`shell`), dialect: P([`cmd`, `git-bash`]), id: U, label: U, path: U }),
  ]),
  Yc = k(I).transform(() => [...Ts]),
  Xc = A({
    zai: P([`oauth`, `apiKey`]).optional(),
    bigmodel: P([`oauth`, `apiKey`]).optional(),
  }).partial(),
  Zc = P([`zai`, `bigmodel`]),
  Qc = A({ zai: w().trim().min(1).optional(), bigmodel: w().trim().min(1).optional() }).partial();
function $c(e) {
  return e?.repoSnapshotIndexingEnabled === !0 && e.repoSnapshotIndexingUserConfigured === !0;
}
var el = A({
    version: U,
    title: U,
    markdown: U,
    releaseDate: U.optional(),
    releaseNotesByLocale: no(Uc, A({ title: U, markdown: U })).optional(),
  }),
  tl = no(Kc, U).default({}),
  nl = M(`kind`, [
    A({
      kind: F(`ssh`),
      host: U,
      port: E().int().positive().max(65535).optional(),
      username: U,
      sshConfigAlias: U.optional(),
      privateKeyPath: w().optional(),
      assetInstallMode: P(os).optional(),
      resourcePackages: A({ selectedPackageIds: k(w().refine(ps)).optional() }).optional(),
      passwordCredentialKey: U.optional(),
      privateKeyPassphraseCredentialKey: U.optional(),
    }),
    A({ kind: F(`wsl`), distro: w().optional(), user: Tc.optional() }),
    A({ kind: F(`docker`), container: U }),
    A({
      kind: F(`server`),
      url: w().url(),
      name: U.optional(),
      workspacePath: w().optional(),
      serverId: U.optional(),
      tokenCredentialKey: U.optional(),
    }),
  ]),
  rl = M(`kind`, [
    A({
      kind: F(`local`),
      workspacePath: U,
      workspacePurpose: P([`project`, `conversation`]).default(`project`),
    }),
    A({
      kind: F(`remote`),
      workspacePath: U,
      localWorkspacePath: U.optional(),
      workspaceIdentity: U.optional(),
      target: nl,
      lastOpenedAt: E().int().nonnegative(),
      lastConnectionStatus: P([`connected`, `failed`]),
      lastConnectionError: w().optional(),
    }),
  ]),
  il = A({ deviceSid: U }),
  al = A({ workspacePath: U, workspaceIdentity: U.optional(), initialTaskId: U.optional() }),
  ol = ko((e) => {
    if (typeof e != `string`) return;
    let t = e.trim();
    if (t)
      try {
        return Nc(t);
      } catch {
        return;
      }
  }, w().optional());
function sl(e) {
  if (!e || typeof e != `object` || Array.isArray(e)) return e;
  let t = e;
  if (!(`zcodeEndpointOrigin` in t)) return e;
  let n = ol.safeParse(t.zcodeEndpointOrigin);
  if (n.success && typeof n.data == `string`) return { ...t, zcodeEndpointOrigin: n.data };
  let { zcodeEndpointOrigin: r, ...i } = t;
  return i;
}
function cl(e) {
  if (!e || typeof e != `object` || Array.isArray(e)) return e;
  let t = e;
  return t.optimizeAgentExperienceMigrationInitialized === !0
    ? e
    : { ...t, optimizeAgentExperienceEnabled: !1, optimizeAgentExperienceMigrationInitialized: !0 };
}
function ll(e) {
  if (!e || typeof e != `object` || Array.isArray(e)) return e;
  let t = e;
  return t.closeToTrayOnWindowsMigrationInitialized === !0
    ? e
    : { ...t, closeToTrayOnWindows: !0, closeToTrayOnWindowsMigrationInitialized: !0 };
}
function ul(e) {
  if (!e || typeof e != `object` || Array.isArray(e)) return e;
  let t = e;
  if (`localePreference` in t || !(`locale` in t)) return e;
  let n = Uc.safeParse(t.locale);
  return n.success ? { ...t, localePreference: n.data } : e;
}
var dl = A({
  id: U,
  workspacePath: U,
  localWorkspacePath: U.optional(),
  workspaceIdentity: U.optional(),
  target: nl,
  lastOpenedAt: E().int().nonnegative(),
  lastConnectionStatus: P([`connected`, `failed`]),
  lastConnectionError: w().optional(),
});
function fl(e) {
  return !e || typeof e != `object` || Array.isArray(e)
    ? e
    : { ...e, enabledBuiltinAgentCliProviders: [...Ts] };
}
function pl(e) {
  if (!e || typeof e != `object` || Array.isArray(e)) return e;
  let t = e;
  if (t.kind !== `ssh` || !(`resourcePackages` in t)) return e;
  let { resourcePackages: n, ...r } = t;
  return r;
}
function ml(e) {
  if (!e || typeof e != `object` || Array.isArray(e)) return e;
  let t = e,
    n = { ...t },
    r = Array.isArray(t.lastWorkspaceSession) ? t.lastWorkspaceSession : [],
    i = r.some((e) => (!e || typeof e != `object` || Array.isArray(e) ? !1 : `historyId` in e)),
    a = Array.isArray(t.remoteWorkspaceHistory) ? t.remoteWorkspaceHistory : [],
    o = new Map(
      a.flatMap((e) => {
        let t = e && typeof e == `object` && !Array.isArray(e) ? { ...e, target: pl(e.target) } : e,
          n = dl.safeParse(t);
        return n.success ? [[n.data.id, n.data]] : [];
      }),
    ),
    s =
      r.length > 0
        ? r.flatMap((e) => {
            if (!e || typeof e != `object` || Array.isArray(e)) return [];
            let t = e;
            if (t.kind === `local` && typeof t.workspacePath == `string`)
              return [
                {
                  kind: `local`,
                  workspacePath: t.workspacePath,
                  workspacePurpose:
                    t.workspacePurpose === `conversation` ? `conversation` : `project`,
                },
              ];
            if (t.kind === `remote`) {
              if (typeof t.workspacePath == `string` && t.target)
                return [{ ...t, target: pl(t.target) }];
              if (typeof t.historyId == `string`) {
                let e = o.get(t.historyId);
                return e
                  ? [
                      {
                        kind: `remote`,
                        workspacePath: e.workspacePath,
                        ...(e.localWorkspacePath
                          ? { localWorkspacePath: e.localWorkspacePath }
                          : {}),
                        ...(e.workspaceIdentity ? { workspaceIdentity: e.workspaceIdentity } : {}),
                        target: pl(e.target),
                        lastOpenedAt: e.lastOpenedAt,
                        lastConnectionStatus: e.lastConnectionStatus,
                        ...(e.lastConnectionError
                          ? { lastConnectionError: e.lastConnectionError }
                          : {}),
                      },
                    ]
                  : [];
              }
            }
            return [];
          })
        : [],
    c = Array.isArray(t.lastOpenTabs)
      ? t.lastOpenTabs.flatMap((e) =>
          typeof e == `string`
            ? [{ kind: `local`, workspacePath: e, workspacePurpose: `project` }]
            : [],
        )
      : [],
    l = new Set(
      s.flatMap((e) =>
        e.kind === `local` && typeof e.workspacePath == `string` ? [e.workspacePath] : [],
      ),
    ),
    u = [...s, ...c.filter((e) => !l.has(e.workspacePath))];
  return (
    (u.length > 0 || i || Array.isArray(t.lastOpenTabs)) && (n.lastWorkspaceSession = u),
    delete n.lastOpenTabs,
    delete n.remoteWorkspaceHistory,
    n
  );
}
(ko(
  (e) => ll(cl(ul(sl(ml(fl(e)))))),
  A({
    recentProjects: k(w()).default([]),
    locale: Uc.default(`zh-CN`),
    localePreference: Wc.default(`system`),
    terminalInheritSystemProfile: D().default(!0),
    terminalFontFamily: U.optional(),
    integratedTerminalShell: Jc.optional(),
    httpProxy: U.optional(),
    httpProxyNoProxy: U.optional(),
    httpProxyCaCertPath: U.optional(),
    taskAutoArchiveEnabled: D().default(!1),
    taskAutoArchiveOlderThanDays: E().int().positive().max(365).default(7),
    closeToTrayOnWindows: D().default(!0),
    closeToTrayOnWindowsMigrationInitialized: D().default(!0),
    keepAwakeWhileRunning: D().default(!1),
    desktopZoomLevel: qc.optional(),
    desktopChromiumHardwareAccelerationEnabled: D().default(!0),
    messageStreamShowReasoning: D().default(!1),
    messageStreamShowTodos: D().default(!1),
    zcodeInteractionBehavior: Gc.default(`queue`),
    askUserQuestionAutoResolutionEnabled: D().default(!0),
    optimizeAgentExperienceEnabled: D().default(!1),
    optimizeAgentExperienceMigrationInitialized: D().default(!0),
    enabledBuiltinAgentCliProviders: Yc.default([...Ts]),
    modelProviderFamilyModes: Xc.default({}),
    modelProviderFamilySelectedKeys: Qc.default({}),
    providerFamilyDomain: Zc.optional(),
    providerFamilyDomainUpdatedAt: E().int().nonnegative().optional(),
    providerFamilyDomainMigrated: D().default(!1),
    repoSnapshotIndexingEnabled: D().default(!1),
    repoSnapshotIndexingUserConfigured: D().optional(),
    instantGrepIndexingEnabled: D().default(!1),
    nativeSearchEnhancementsEnabled: D().default(!0),
    memoryEnabled: D().default(!1),
    lastWorkspaceSession: k(rl).default([]),
    lastActiveTabIndex: E().int().nonnegative().default(0),
    lastActiveTaskByWorkspace: N(w(), w()).optional(),
    dataBaseDir: w().trim().min(1).optional(),
    pendingPostUpdateReleaseNotes: el.optional(),
    receivePreviewUpdates: D().default(!1),
    autoDownloadAndInstallUpdates: D().default(!1),
    skippedElectronUpdateVersions: tl,
    settingsSyncFirstRunPromptHandled: D().optional(),
    webRemoteControlExternalRelayDevice: il.optional(),
    webRemoteControlLastEnabledContext: al.optional(),
    zcodeEndpointOrigin: ol.optional(),
  }),
),
  A({
    recentProjects: k(w()).optional(),
    locale: Uc.optional(),
    localePreference: Wc.optional(),
    terminalInheritSystemProfile: D().optional(),
    terminalFontFamily: U.optional(),
    integratedTerminalShell: Jc.optional(),
    httpProxy: U.optional(),
    httpProxyNoProxy: U.optional(),
    httpProxyCaCertPath: U.optional(),
    taskAutoArchiveEnabled: D().optional(),
    taskAutoArchiveOlderThanDays: E().int().positive().max(365).optional(),
    closeToTrayOnWindows: D().optional(),
    keepAwakeWhileRunning: D().optional(),
    closeToTrayOnWindowsMigrationInitialized: D().optional(),
    desktopZoomLevel: qc.optional(),
    desktopChromiumHardwareAccelerationEnabled: D().optional(),
    messageStreamShowReasoning: D().optional(),
    messageStreamShowTodos: D().optional(),
    zcodeInteractionBehavior: Gc.optional(),
    askUserQuestionAutoResolutionEnabled: D().optional(),
    optimizeAgentExperienceEnabled: D().optional(),
    optimizeAgentExperienceMigrationInitialized: D().optional(),
    enabledBuiltinAgentCliProviders: Yc.optional(),
    modelProviderFamilyModes: Xc.optional(),
    modelProviderFamilySelectedKeys: Qc.optional(),
    providerFamilyDomain: j([Zc, F(``)]).optional(),
    providerFamilyDomainUpdatedAt: E().int().nonnegative().optional(),
    providerFamilyDomainMigrated: D().optional(),
    repoSnapshotIndexingEnabled: D().optional(),
    repoSnapshotIndexingUserConfigured: D().optional(),
    instantGrepIndexingEnabled: D().optional(),
    nativeSearchEnhancementsEnabled: D().optional(),
    memoryEnabled: D().optional(),
    lastWorkspaceSession: k(rl).optional(),
    lastActiveTabIndex: E().int().nonnegative().optional(),
    lastActiveTaskByWorkspace: N(w(), w()).optional(),
    dataBaseDir: w().trim().min(1).optional(),
    pendingPostUpdateReleaseNotes: el.optional(),
    receivePreviewUpdates: D().optional(),
    autoDownloadAndInstallUpdates: D().optional(),
    skippedElectronUpdateVersions: no(Kc, U).optional(),
    settingsSyncFirstRunPromptHandled: D().optional(),
    webRemoteControlExternalRelayDevice: il.optional(),
    webRemoteControlLastEnabledContext: al.optional(),
    zcodeEndpointOrigin: ol.optional(),
  }));
var hl = P([
    `default`,
    `yolo`,
    `plan`,
    `edit`,
    `acceptEdits`,
    `auto`,
    `dontAsk`,
    `bypassPermissions`,
    `autoEdit`,
    `build`,
  ]),
  gl = `builtin:`,
  W = {
    zai: `${gl}zai`,
    zaiCodingPlan: `${gl}zai-coding-plan`,
    zaiStartPlan: `${gl}zai-start-plan`,
    bigmodel: `${gl}bigmodel`,
    bigmodelCodingPlan: `${gl}bigmodel-coding-plan`,
    bigmodelStartPlan: `${gl}bigmodel-start-plan`,
    zapi: `${gl}zapi`,
  };
function _l(e) {
  return (
    e === W.zai ||
    e === W.zaiCodingPlan ||
    e === W.zaiStartPlan ||
    e === W.bigmodel ||
    e === W.bigmodelCodingPlan ||
    e === W.bigmodelStartPlan ||
    e === W.zapi
  );
}
function vl(e) {
  return e === W.zaiCodingPlan || e === W.zaiStartPlan;
}
function yl(e) {
  return e === W.zaiStartPlan || e === W.bigmodelStartPlan;
}
function bl(e) {
  return vl(e) || e === W.bigmodelCodingPlan || e === W.bigmodelStartPlan;
}
var xl = [`GLM-5.2`, `GLM-5-Turbo`],
  Sl = [`max`, `high`, `nothink`],
  Cl = `glm-5.2`,
  wl = /^glm-\d{4}(?:$|[^0-9a-z])/;
function Tl(e) {
  let t = e.toLowerCase(),
    n = t.split(`/`).filter(Boolean).at(-1);
  return (n && n !== t ? [t, n] : [t]).some((e) => e.startsWith(Cl) || wl.test(e));
}
var El = {
    claude: { haiku: `GLM-5-Turbo`, sonnet: `GLM-5-Turbo`, opus: `GLM-5.2`, reasoning: `GLM-5.2` },
  },
  Dl = A({ claude: A({ haiku: w(), sonnet: w(), opus: w(), reasoning: w() }).optional() }).catchall(
    O(),
  ),
  Ol = P([`anthropic`, `openai`, `responses`, `gemini`]),
  kl = P([`anthropic-messages`, `openai-chat-completions`, `openai-responses`]),
  Al = P([`anthropic`, `openai`, `openai-compatible`]),
  jl = P([`china-llm-zcode-dev`]),
  Ml = P([`text`, `image`, `video`, `audio`, `pdf`]),
  Nl = A({ path: k(w().min(1)).min(1) }),
  Pl = A({ set: k(Nl.extend({ value: O() })).optional(), unset: k(Nl).optional() }),
  Fl = A({ defaultLevel: w().min(1).optional(), levels: N(w().min(1), no(Al, Pl)) }),
  Il = no(Al, w()),
  Ll = A({ baseURL: w(), paths: Il }),
  Rl = A({
    id: w().min(1),
    name: w().optional(),
    kinds: k(Al),
    defaultKind: Al.optional(),
    modelIdByKind: no(Al, w().min(1)).optional(),
    modalities: A({ input: k(Ml), output: k(Ml) }),
    contextWindow: E().int().positive(),
    maxOutputTokens: E().int().positive().optional(),
    reasoning: Fl.optional(),
    priority: E().finite().optional(),
  }),
  zl = A({
    id: w().min(1),
    name: w().min(1),
    endpoints: Ll,
    defaultKind: Al.optional(),
    models: k(Rl),
  });
A({ schemaVersion: F(`zcode.model-providers.v1`), providers: k(zl) });
var Bl = Rl.extend({
    disabledReason: w().optional(),
    supportsTools: D().optional(),
    supportsStructuredOutput: D().optional(),
    modified: D().optional(),
    deleted: D().optional(),
  }),
  Vl = P([`builtin`, `models-dev`, `custom`, `workspace`]),
  Hl = P([
    `coding_plan_not_authenticated`,
    `coding_plan_not_connected`,
    `coding_plan_auth_failed`,
    `coding_plan_not_entitled`,
    `oauth_provider_inactive`,
  ]),
  Ul = A({ anthropic: w().default(``), openai: w().default(``), gemini: w().default(``) }),
  Wl = Ul.extend({
    anthropic: w().optional(),
    openai: w().optional(),
    gemini: w().optional(),
    baseURL: w().optional(),
    paths: Il.optional(),
  });
A({
  id: w(),
  name: w(),
  enabled: D().optional(),
  systemDisabledReason: Hl.optional(),
  endpoints: Ul,
  apiFormat: kl.optional(),
  source: Vl.optional(),
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
  updatedAt: E(),
});
var Gl = k(
  A({
    id: w(),
    name: w(),
    enabled: D().optional(),
    systemDisabledReason: Hl.optional(),
    endpoints: Wl,
    apiFormat: kl.optional(),
    source: Vl.optional(),
    catalogSourceId: jl.optional(),
    catalogProviderId: w().optional(),
    modelsDevProviderId: w().optional(),
    apiKeyRequired: D().optional(),
    headers: N(w(), w()).optional(),
    logoUrl: w().optional(),
    apiKey: w(),
    apiKeyUrl: w().optional(),
    defaultKind: Al.optional(),
    models: k(Bl).default([]),
    modelDisplayNames: N(w(), w()).optional(),
    modelSupportedFormats: N(w(), k(Ol)).optional(),
    providerMappings: Dl.optional(),
    createdAt: E(),
    updatedAt: E(),
  }),
);
(A({ schemaVersion: F(`zcode.model-providers.v2`), providers: Gl }),
  A({ providerIds: k(w().min(1)), updatedAt: E().int().nonnegative() }));
function Kl(e) {
  return e?.enabled !== !1;
}
function ql(e) {
  return !Kl(e) || (e.apiKeyRequired !== !1 && e.apiKey.trim().length === 0)
    ? !1
    : ru(e).some((t) =>
        iu(e, t)?.disabledReason?.trim()
          ? !1
          : Tu({ provider: e, modelName: t }).some((t) => {
              let n = ou(t);
              return n ? vu(e, n).length > 0 : !1;
            }),
      );
}
function Jl(e) {
  return e.some(ql);
}
var Yl = 2e5,
  Xl = Yl,
  Zl = 1e6;
function Ql(e) {
  return e.trim().toLowerCase().endsWith(`[1m]`);
}
function $l(e, t) {
  if (Ql(e)) return Zl;
  if (typeof t != `number` || !Number.isFinite(t)) return Xl;
  let n = Math.floor(t);
  return n > 0 ? n : Xl;
}
function eu(e) {
  return e.id.trim();
}
function tu(e) {
  return typeof e == `object` && !!e;
}
function nu(e) {
  return e.name?.trim() || e.id;
}
function ru(e) {
  return e
    ? e.models
        .filter((e) => !tu(e) || e.deleted !== !0)
        .map((e) => (tu(e) ? e.id.trim() : e.trim()))
        .filter((e) => e.length > 0)
    : [];
}
function iu(e, t) {
  let n = t.trim();
  return e.models.find((e) => tu(e) && e.deleted !== !0 && e.id.trim() === n);
}
function au(e) {
  return [...new Set(e)];
}
function ou(e) {
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
function su(e) {
  switch (e) {
    case `anthropic`:
      return `anthropic`;
    case `openai`:
      return `responses`;
    case `openai-compatible`:
      return `openai`;
  }
}
function cu(e) {
  let t = [...new Set(e.modalities?.input ?? [`text`])],
    n = [...new Set(e.modalities?.output ?? [`text`])];
  return {
    id: e.id.trim(),
    name: e.name?.trim() || void 0,
    kinds: au([...(e.kinds ?? [])]),
    ...(e.defaultKind ? { defaultKind: e.defaultKind } : {}),
    modalities: { input: t, output: n },
    contextWindow: $l(e.id, e.contextWindow),
    ...(e.maxOutputTokens ? { maxOutputTokens: e.maxOutputTokens } : {}),
    ...(e.reasoning ? { reasoning: e.reasoning } : {}),
    ...(e.priority !== void 0 && Number.isFinite(e.priority) ? { priority: e.priority } : {}),
    ...(e.disabledReason ? { disabledReason: e.disabledReason } : {}),
    ...(e.supportsTools === void 0 ? {} : { supportsTools: e.supportsTools }),
    ...(e.supportsStructuredOutput === void 0
      ? {}
      : { supportsStructuredOutput: e.supportsStructuredOutput }),
    ...(e.modified === void 0 ? {} : { modified: e.modified }),
    ...(e.deleted === void 0 ? {} : { deleted: e.deleted }),
  };
}
function lu(e) {
  if (e.defaultKind) return e.defaultKind;
  let t = e.endpoints.paths;
  if (t?.[`openai-compatible`] !== void 0) return `openai-compatible`;
  if (t?.openai !== void 0) return `openai`;
  if (t?.anthropic !== void 0) return `anthropic`;
  switch (Cu(e)) {
    case `anthropic-messages`:
      return `anthropic`;
    case `openai-responses`:
      return `openai`;
    case `openai-chat-completions`:
      return `openai-compatible`;
  }
}
function uu(e) {
  switch (e) {
    case `anthropic`:
      return `anthropic-messages`;
    case `openai`:
      return `openai-responses`;
    case `openai-compatible`:
      return `openai-chat-completions`;
  }
}
function du(e) {
  switch (e) {
    case `anthropic-messages`:
      return `anthropic`;
    case `openai-responses`:
      return `openai`;
    case `openai-chat-completions`:
      return `openai-compatible`;
  }
}
function fu(e) {
  switch (e) {
    case `anthropic`:
      return `/v1/messages`;
    case `openai`:
      return `/responses`;
    case `openai-compatible`:
      return `/chat/completions`;
  }
}
function pu(e) {
  try {
    let t = new URL(e);
    return t.protocol === `http:` || t.protocol === `https:`;
  } catch {
    return !1;
  }
}
function mu(e) {
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
function hu(e, t) {
  let n = e.trim(),
    r = t.trim();
  return r
    ? pu(r) || !n
      ? r
      : n.endsWith(`/`) && r.startsWith(`/`)
        ? `${n.slice(0, -1)}${r}`
        : !n.endsWith(`/`) && !r.startsWith(`/`)
          ? `${n}/${r}`
          : `${n}${r}`
    : n;
}
function gu(e, t) {
  let n = {
      anthropic: [`/v1/messages`, `/messages`],
      openai: [`/responses`],
      "openai-compatible": [`/chat/completions`],
    },
    r = _u(e);
  for (let e of n[t])
    if (r.toLowerCase().endsWith(e)) {
      r = r.slice(0, -e.length);
      break;
    }
  return r.replace(/\/+$/, ``);
}
function _u(e) {
  return mu(e).replace(/\/+$/, ``);
}
function vu(e, t = du(Cu(e))) {
  let n = e.endpoints.baseURL?.trim() ?? ``,
    r = e.endpoints.paths ?? {};
  return (!e.endpoints.baseURL?.trim() && !e.endpoints.paths) || r[t] === void 0
    ? ``
    : gu(hu(n, r[t] ?? ``), t);
}
function yu(e) {
  let t = [],
    n = e.paths;
  return e.baseURL?.trim() || n
    ? (n?.anthropic !== void 0 && t.push(`anthropic`),
      n?.openai !== void 0 && t.push(`openai`),
      n?.[`openai-compatible`] !== void 0 && t.push(`openai-compatible`),
      t)
    : [];
}
function bu(e, t) {
  return !!(e && Object.prototype.hasOwnProperty.call(e, t));
}
function xu(e) {
  let t = [],
    n = e.paths;
  return e.baseURL?.trim() || n
    ? (n?.anthropic !== void 0 && t.push(`anthropic`),
      n?.[`openai-compatible`] !== void 0 && t.push(`openai`),
      n?.openai !== void 0 && t.push(`responses`),
      t)
    : [];
}
function Su(e) {
  switch (e) {
    case `anthropic-messages`:
      return [`anthropic`];
    case `openai-responses`:
      return [`responses`];
    case `openai-chat-completions`:
      return [`openai`];
  }
}
function Cu(e) {
  return e.apiFormat === `anthropic-messages` ||
    e.apiFormat === `openai-chat-completions` ||
    e.apiFormat === `openai-responses`
    ? e.apiFormat
    : e.defaultKind
      ? uu(e.defaultKind)
      : e.endpoints.paths?.anthropic === void 0
        ? e.endpoints.paths?.openai === void 0
          ? e.endpoints.paths?.[`openai-compatible`] === void 0
            ? `anthropic-messages`
            : `openai-chat-completions`
          : `openai-responses`
        : `anthropic-messages`;
}
function wu(e) {
  let t = du(Cu(e)),
    n = vu(e, t);
  if (n) return n;
  let r = e.endpoints.baseURL?.trim();
  return r ? gu(r, t) : vu(e, t);
}
function Tu(e) {
  if (!e.modelName.trim()) return [];
  let t = iu(e.provider, e.modelName);
  return t
    ? t.kinds.map(su)
    : bu(e.provider.modelSupportedFormats, e.modelName)
      ? [...(e.provider.modelSupportedFormats?.[e.modelName] ?? [])]
      : xu(e.provider.endpoints);
}
var Eu = `ZCode Protocol`,
  G = w().trim().min(1),
  K = N(w(), O()),
  q = E().int().nonnegative(),
  Du = j([q, G, Ja()]),
  Ou = A({
    kind: F(`node_repl_images`),
    images: k(
      A({
        base64: w()
          .min(1)
          .max(200 * 1024),
        mimeType: w().regex(/^image\/[a-z0-9.+-]+$/iu),
      }).strict(),
    )
      .min(1)
      .max(2),
    truncated: D().optional(),
    source: F(`browser_turn_end`).optional(),
  }).strict(),
  ku = K.superRefine((e, t) => {
    let n = e.display;
    if (typeof n != `object` || !n || Array.isArray(n) || n.kind !== `node_repl_images`) return;
    let r = Ou.safeParse(n);
    if (!r.success)
      for (let e of r.error.issues) t.addIssue({ ...e, path: [`display`, ...e.path] });
  }),
  Au = j([w(), E().int()]),
  ju = A({
    traceId: G.optional(),
    parentId: G.optional(),
    spanId: G.optional(),
    traceparent: G.optional(),
  }).strict();
j([
  A({ id: Au, method: G, params: O().optional(), trace: ju.optional() }).strict(),
  A({ method: G, params: O().optional(), trace: ju.optional() }).strict(),
  A({ id: Au, result: O() }).strict(),
  A({ id: Au, error: A({ code: E().int(), message: G, data: O().optional() }).strict() }).strict(),
]);
var Mu = A({
    platform: P([
      `aix`,
      `android`,
      `darwin`,
      `freebsd`,
      `haiku`,
      `linux`,
      `netbsd`,
      `openbsd`,
      `sunos`,
      `win32`,
      `cygwin`,
    ]),
    arch: P([
      `arm`,
      `arm64`,
      `ia32`,
      `loong64`,
      `mips`,
      `mipsel`,
      `ppc`,
      `ppc64`,
      `riscv64`,
      `s390`,
      `s390x`,
      `x64`,
    ]),
    logicalCpuCount: E().int().positive().max(4096),
    intervalMs: E()
      .int()
      .positive()
      .max(10080 * 60 * 1e3),
    cpuCores: E().finite().nonnegative().max(4096),
    cpuPercent: E().finite().nonnegative().max(1e5),
    rssKb: E()
      .finite()
      .nonnegative()
      .max(2 ** 53 - 1),
  }).strict(),
  Nu = As,
  Pu = P([`immediate`, `deferred`]),
  Fu = A({ optionId: G, kind: G, name: G, description: w().optional(), response: Fs }).strict(),
  Iu = A({ name: G, value: w() }).strict(),
  Lu = j([
    A({
      type: F(`client_credentials`),
      clientId: G,
      clientSecret: G,
      clientName: G.optional(),
      scope: w().optional(),
    }).strict(),
    A({
      type: F(`authorization_code`),
      clientId: G.optional(),
      clientSecret: G.optional(),
      clientName: G.optional(),
      redirectPath: G.optional(),
      scope: w().optional(),
    }).strict(),
  ]),
  Ru = j([
    A({
      name: G,
      command: G,
      args: k(w()),
      env: k(Iu),
      isolation: P([`session`, `workspace`]).optional(),
      protocolVersion: P([`legacy`, `auto`, `2026-07-28`]).optional(),
      timeoutMs: E().int().positive().optional(),
    }).strict(),
    A({
      name: G,
      type: P([`http`, `sse`]),
      url: G,
      headers: k(Iu),
      oauth: Lu.optional(),
      isolation: P([`session`, `workspace`]).optional(),
      protocolVersion: P([`legacy`, `auto`, `2026-07-28`]).optional(),
      timeoutMs: E().int().positive().optional(),
    }).strict(),
  ]),
  zu = A({
    status: P([`connecting`, `connected`, `disabled`, `disconnected`, `failed`, `untrusted`]),
    transport: P([`stdio`, `http`, `sse`]),
    toolCount: E().int().nonnegative(),
    updatedAt: G,
    error: w().optional(),
    protocolEra: P([`legacy`, `modern`]).optional(),
    authorization: A({ type: F(`oauth_authorization_code`), authorizationUrl: G, startedAt: G })
      .strict()
      .optional(),
  }).strict(),
  Bu = P([`connect`, `status`]);
(A({ workspace: B, mcpServers: k(Ru).optional(), mode: Bu.default(`connect`) }).strict(),
  A({ statuses: N(w(), zu) }).strict());
var Vu = A({ role: P([`user`, `assistant`]), content: w(), timestamp: q.optional() }).strict(),
  Hu = A({
    source: F(`claudeCode`),
    title: w().optional(),
    createdAt: q.optional(),
    updatedAt: q.optional(),
    messages: k(Vu).min(1),
  }).strict(),
  Uu = A({ value: G, label: G, description: w().optional() }).strict(),
  Wu = A({
    enabled: D(),
    levels: k(Uu),
    defaultLevel: G.optional(),
    providerOptionsByLevel: N(G, K).optional(),
  }).strict(),
  Gu = A({
    ref: V,
    label: G,
    providerLabel: G.optional(),
    providerSource: w().optional(),
    providerLogoUrl: G.optional(),
    description: w().optional(),
    contextWindow: E().int().positive().optional(),
    maxOutputTokens: E().int().positive().optional(),
    reasoning: Wu.optional(),
    supportsImages: D().optional(),
    supportsPdf: D().optional(),
    supportsTools: D().optional(),
    supportsStructuredOutput: D().optional(),
    disabledReason: w().optional(),
  }).strict(),
  Ku = P([`anthropic`, `openai`, `openai-compatible`]),
  qu = P([`anthropic-messages`, `openai-chat-completions`, `openai-responses`]),
  Ju = P([`builtin`, `models-dev`, `custom`, `user`, `workspace`, `ephemeral`]),
  Yu = M(`source`, [
    A({ source: F(`credential`), key: G }).strict(),
    A({ source: F(`env`), name: G }).strict(),
    A({ source: F(`server-config`), key: G }).strict(),
    A({ source: F(`session-secret`), key: G }).strict(),
  ]),
  Xu = M(`source`, [
    A({ source: F(`credential`), key: G }).strict(),
    A({ source: F(`env`), name: G }).strict(),
    A({ source: F(`server-config`), key: G }).strict(),
    A({ source: F(`inline`), value: G }).strict(),
  ]),
  Zu = A({
    modelId: G,
    label: G.optional(),
    description: w().optional(),
    contextWindow: E().int().positive().optional(),
    maxOutputTokens: E().int().positive().optional(),
    reasoning: Wu.optional(),
    supportsImages: D().optional(),
    supportsPdf: D().optional(),
    supportsTools: D().optional(),
    supportsStructuredOutput: D().optional(),
    providerOptions: K.optional(),
    disabledReason: w().optional(),
  }).strict(),
  Qu = A({
    providerId: G,
    kind: Ku,
    apiFormat: qu.optional(),
    label: G.optional(),
    source: Ju.default(`workspace`),
    baseURL: G.optional(),
    apiKeyRef: Yu.optional(),
    apiKeyRequired: D().optional(),
    headers: N(w(), w()).optional(),
    providerOptions: K.optional(),
    logoUrl: G.optional(),
    modelsDevProviderId: G.optional(),
    models: k(Zu),
    disabledReason: w().optional(),
    updatedAt: q.optional(),
  }).strict(),
  $u = A({
    providerId: G,
    kind: Ku,
    apiFormat: qu.optional(),
    label: G.optional(),
    source: Ju.default(`workspace`),
    baseURL: G.optional(),
    apiKey: Xu.optional(),
    apiKeyRequired: D().optional(),
    headers: N(w(), w()).optional(),
    providerOptions: K.optional(),
    logoUrl: G.optional(),
    modelsDevProviderId: G.optional(),
    models: k(Zu).min(1),
  }).strict(),
  J = A({
    revision: G,
    generatedAt: q,
    model: V,
    provider: $u,
    thoughtLevel: G.optional(),
  }).strict();
A({ sessionId: G, appliedModelRuntimeRevision: G, changed: D() }).strict();
function ed(e) {
  let t = e.paths
    ? Object.fromEntries(Object.entries(e.paths).map(([e, t]) => [e, t.trim()]))
    : void 0;
  return {
    ...(e.baseURL === void 0 ? {} : { baseURL: e.baseURL.trim() }),
    ...(t ? { paths: t } : {}),
  };
}
function td(e) {
  let t = Cu(e),
    n = du(t),
    r = vu(e, n);
  return r ? { apiFormat: t, kind: n, baseURL: r } : null;
}
function nd(e) {
  return e.source === `builtin` || e.id.startsWith(`builtin:`)
    ? `builtin`
    : e.source === `models-dev`
      ? `models-dev`
      : e.source === `custom`
        ? `custom`
        : `workspace`;
}
function rd(e, t) {
  let n = iu(e, t);
  return n
    ? n.kinds.map(su)
    : (e.modelSupportedFormats?.[t] ?? (e.apiFormat ? Su(e.apiFormat) : void 0) ?? xu(e.endpoints));
}
function id(e, t) {
  let n = iu(e, t);
  if (n) return { explicit: !0, model: n };
  let r = rd(e, t).flatMap((e) => {
    let t = ou(e);
    return t ? [t] : [];
  });
  return {
    explicit: !1,
    model: cu({ id: t, name: e.modelDisplayNames?.[t], kinds: r, defaultKind: lu(e) }),
  };
}
function ad(e) {
  if (!e) return;
  let t = Object.fromEntries(
    Object.entries(e)
      .map(([e, t]) => [e.trim(), t.trim()])
      .filter(([e, t]) => e.length > 0 && t.length > 0),
  );
  return Object.keys(t).length > 0 ? t : void 0;
}
function od(e) {
  let t = e.trim();
  return t ? `${t.slice(0, 1).toUpperCase()}${t.slice(1)}` : e;
}
function sd(e, t) {
  return e.kinds.includes(t);
}
function cd(e, t) {
  if (!e) return;
  let n = Object.keys(e.levels);
  if (n.length === 0) return;
  let r = e.defaultLevel && n.includes(e.defaultLevel) ? e.defaultLevel : n[0],
    i = ld(e, t);
  return {
    enabled: !0,
    levels: n.map((e) => ({ value: e, label: od(e) })),
    ...(r ? { defaultLevel: r } : {}),
    ...(i ? { providerOptionsByLevel: i } : {}),
  };
}
function ld(e, t) {
  let n = Object.entries(e.levels).flatMap(([e, n]) => {
    let r = n[t],
      i = r ? dd(r) : void 0,
      a = i ? { [ud(t)]: i } : void 0;
    return a ? [[e, a]] : [];
  });
  return n.length > 0 ? Object.fromEntries(n) : void 0;
}
function ud(e) {
  switch (e) {
    case `anthropic`:
      return `anthropic`;
    case `openai`:
      return `openai`;
    case `openai-compatible`:
      return `openaiCompatible`;
  }
}
function dd(e) {
  let t = {};
  for (let n of e.set ?? []) fd(t, n.path, n.value);
  for (let n of e.unset ?? []) pd(t, n.path);
  return Object.keys(t).length > 0 ? t : void 0;
}
function fd(e, t, n) {
  let [r, ...i] = t.map((e) => e.trim()).filter(Boolean);
  if (!r) return;
  if (i.length === 0) {
    e[r] = n;
    return;
  }
  let a = e[r],
    o = a && typeof a == `object` && !Array.isArray(a) ? a : {};
  ((e[r] = o), fd(o, i, n));
}
function pd(e, t) {
  let [n, ...r] = t.map((e) => e.trim()).filter(Boolean);
  if (!n) return;
  if (r.length === 0) {
    delete e[n];
    return;
  }
  let i = e[n];
  !i || typeof i != `object` || Array.isArray(i) || pd(i, r);
}
function md(e, t) {
  return e.modelIdByKind?.[t]?.trim() || e.id.trim();
}
var hd = new Set([`image`, `pdf`]);
function gd(e) {
  return (
    e.source === `models-dev` ||
    !!(e.catalogProviderId?.trim() || e.catalogSourceId?.trim() || e.modelsDevProviderId?.trim())
  );
}
function _d(e) {
  return e.modalities.input.some((e) => hd.has(e));
}
function vd(e, t) {
  return gd(e) || _d(t);
}
function yd(e) {
  let t = ed(e.endpoints),
    n = td({ apiFormat: e.apiFormat, endpoints: t, defaultKind: e.defaultKind });
  if (!n) return null;
  let r = Array.from(new Set(ru(e))).map((t) => id(e, t));
  if (r.length === 0) return null;
  let i = e.apiKey.trim(),
    a = Kl(e) ? void 0 : `Disabled in app model provider settings`,
    o = r.flatMap(({ model: r, explicit: i }) => {
      let o = n.kind;
      if (
        !sd(r, o) ||
        (e.endpoints.paths?.[o] === void 0 &&
          !wu({ apiFormat: n.apiFormat, defaultKind: o, endpoints: t }))
      )
        return [];
      let s = md(r, o),
        c = { modelId: s, providerOptions: { supportedFormats: rd(e, r.id) } },
        l = i ? nu(r) : e.modelDisplayNames?.[r.id]?.trim();
      (l && (c.label = l),
        (i || Ql(s)) && (c.contextWindow = $l(s, r.contextWindow)),
        i &&
          ((c.maxOutputTokens = r.maxOutputTokens),
          (c.reasoning = cd(r.reasoning, o)),
          vd(e, r) &&
            ((c.supportsImages = r.modalities.input.includes(`image`)),
            (c.supportsPdf = r.modalities.input.includes(`pdf`))),
          (c.supportsTools = r.supportsTools),
          (c.supportsStructuredOutput = r.supportsStructuredOutput)));
      let u = a ?? r.disabledReason;
      return (u && (c.disabledReason = u), [c]);
    });
  if (o.length === 0) return null;
  let s = {
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
        modelSupportedFormats: e.modelSupportedFormats ?? {},
      },
      source: nd(e),
    },
    c = e.name.trim();
  (c && (s.label = c), i && (s.apiKey = { source: `inline`, value: i }));
  let l = ad(e.headers);
  return (l && (s.headers = l), s);
}
var bd = A({
    revision: E().int().nonnegative(),
    providerRevision: G.optional(),
    providers: k(Qu),
    available: k(Gu),
    defaultModel: V.optional(),
    lastUsed: V.optional(),
  }).strict(),
  xd = A({
    content: G,
    status: P([`pending`, `in_progress`, `completed`]),
    priority: P([`high`, `medium`, `low`]),
  }).strict(),
  Sd = A({
    timeUsedSeconds: E().int().nonnegative(),
    tokensUsed: E().int().nonnegative(),
    tokenBudget: E().int().positive().nullable(),
    contextUsed: E().int().nonnegative(),
    contextWindow: E().int().nonnegative(),
    toolCallCount: E().int().nonnegative(),
    iterationCount: E().int().nonnegative(),
  }).strict(),
  Cd = A({
    id: G,
    source: P([`goal_iteration`, `session`]),
    goalIteration: E().int().positive().optional(),
    targetId: G.optional(),
    startedAt: q.optional(),
    updatedAt: q.optional(),
    todos: k(xd),
  }).strict(),
  wd = A({
    appliedProviderRevision: G.optional(),
    model: A({ current: V, available: k(Gu), lastUsed: V.optional() }).strict(),
    thoughtLevel: A({
      enabled: D(),
      current: G.optional(),
      defaultLevel: G.optional(),
      available: k(Uu),
    }).strict(),
    mode: A({ current: Is }).strict(),
    permission: A({ mode: Is.optional(), rulesRevision: E().int().nonnegative().optional() })
      .strict()
      .optional(),
  }).strict(),
  Td = A({
    requestId: G,
    toolCallId: G,
    toolName: G,
    reason: w(),
    riskLevel: P([`low`, `medium`, `high`, `critical`]),
    input: O().optional(),
    origin: Us.optional(),
    options: k(Fu).min(1),
    requestedAt: q,
  }).strict(),
  Ed = A({
    toolCallId: G,
    toolName: G,
    status: P([`pending`, `running`, `completed`, `failed`, `denied`]),
    startedAt: q.optional(),
  }).strict(),
  Dd = A({
    sessionId: G,
    status: Ls,
    mode: Is,
    turnCount: E().int().nonnegative(),
    totalTokenCount: E().int().nonnegative(),
    contextUsed: E().int().nonnegative(),
    contextWindow: E().int().nonnegative(),
    currentTurnId: G.optional(),
    pendingPermissions: k(Td),
    activeToolCalls: k(Ed),
    backgroundJobs: k(K),
    target: zs.nullable().optional(),
    lastError: A({ type: G, code: G.optional(), message: G, detail: w().optional() })
      .strict()
      .optional(),
  }).strict(),
  Od = A({
    name: G,
    description: w(),
    inputHint: w().optional(),
    source: P([`builtin`, `custom`]).optional(),
  }).strict(),
  kd = P([
    `start`,
    `finish`,
    `error`,
    `text_start`,
    `text_delta`,
    `text_end`,
    `reasoning_start`,
    `reasoning_delta`,
    `reasoning_end`,
    `tool_input_start`,
    `tool_input_delta`,
    `tool_input_end`,
    `tool_call`,
  ]),
  Ad = A({
    assistantMessageId: w().optional(),
    delta: w().optional(),
    done: D().optional(),
    input: O().optional(),
    kind: kd,
    partId: w().optional(),
    providerExecuted: D().optional(),
    toolCallId: w().optional(),
    toolName: w().optional(),
  }).strict(),
  jd = A({
    protocol: A({ name: F(Eu), version: F(1) }).strict(),
    session: Hs,
    settings: wd,
    projection: Dd,
    runtime: ic,
    messages: k($s),
    goalStats: Sd.optional(),
    todos: k(xd).optional(),
    todoGroups: k(Cd).optional(),
    slashCommands: k(Od).optional(),
  }).strict(),
  Md = A({
    eventId: G,
    sessionId: G,
    turnId: G.optional(),
    seq: E().int().nonnegative(),
    traceId: G.optional(),
    timestamp: q,
    deliveryKind: Os.optional(),
  }).strict();
P([
  `session.created`,
  `session.resumed`,
  `session.updated`,
  `session.titleUpdated`,
  `session.closed`,
  `turn.started`,
  `turn.steerQueued`,
  `turn.steerDrained`,
  `turn.completed`,
  `turn.failed`,
  `message.upserted`,
  `message.removed`,
  `part.started`,
  `part.delta`,
  `part.upserted`,
  `part.removed`,
  `model.streaming`,
  `tool.updated`,
  `permission.requested`,
  `permission.resolved`,
  `userInput.requested`,
  `userInput.resolved`,
  `checkpoint.created`,
  `rewind.triggered`,
  `streamRecovery.updated`,
]);
var Nd = A({
    type: G,
    message: G,
    stack: w().optional(),
    code: w().optional(),
    detail: w().optional(),
    retryable: D().optional(),
    data: O().optional(),
  }).strict(),
  Pd = A({ mode: Is, contextWindow: E().int().nonnegative() }).strict(),
  Fd = A({
    directory: G,
    interruptedToolCount: E().int().nonnegative(),
    messageCount: E().int().nonnegative(),
    partCount: E().int().nonnegative(),
    recoveredCompactTimelineCount: E().int().nonnegative().optional(),
    recoveredSteerInputCount: E().int().nonnegative().optional(),
    resumedTodoCount: E().int().nonnegative().optional(),
  }).strict(),
  Id = A({
    messageID: G.optional(),
    modelRef: K.optional(),
    previousTitle: w(),
    source: P([`default`, `first_input`, `generated`, `custom`]),
    title: w(),
  }).strict(),
  Ld = A({
    turnNumber: E().int().nonnegative(),
    input: w(),
    inputId: G.optional(),
    queryId: G.optional(),
    inputSource: Nu.optional(),
    inputVisibility: ks.optional(),
    executionKind: P([`agent`, `controlOnly`]).optional(),
    targetId: G.optional(),
    messageId: G.optional(),
    foregroundExecutionId: G.optional(),
    intent: K.optional(),
    originMeta: K.optional(),
    attachments: k(K).optional(),
  }).strict(),
  Rd = F(`plan_approval_feedback`),
  zd = P([`sendText`, `sendGoalCommand`, `compact`]),
  Bd = P([`queue`, `guide`]),
  Vd = A({
    pendingInputId: G,
    inputId: G.optional(),
    queryId: G.optional(),
    input: w(),
    inputPreview: w(),
    inputSize: E().int().nonnegative(),
    commandKind: zd.optional(),
    source: Rd.optional(),
    toolDisallowlist: k(G).optional(),
    delivery: Bd.optional(),
    targetTurnId: G,
    queueLength: E().int().nonnegative(),
    intent: K.optional(),
  }).strict(),
  Hd = A({
    pendingInputIds: k(G),
    queryIds: k(G).optional(),
    targetTurnId: G,
    injectedMessageIds: k(G),
    drainedInputs: k(
      A({
        pendingInputId: G,
        messageId: G,
        text: w(),
        delivery: Bd.optional(),
        intent: K.optional(),
        toolDisallowlist: k(G).optional(),
      }).strict(),
    ).optional(),
  }).strict(),
  Ud = A({
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
      cacheReadTokens: E().int().nonnegative().optional(),
    })
      .strict()
      .optional(),
    inputId: G.optional(),
    resultType: P([
      `success`,
      `cancelled`,
      `error_max_turns`,
      `error_max_budget`,
      `error_during_execution`,
      `error_max_tool_calls`,
    ]),
  }).strict(),
  Wd = A({ error: Nd, turnPhase: w(), inputId: G.optional() }).strict(),
  Gd = A({
    content: w(),
    attachments: k(O()).optional(),
    toolCalls: k(O()).optional(),
    type: w().optional(),
    compactBoundary: O().optional(),
  }).strict(),
  Kd = A({ messageId: G, reason: w().optional() }).strict(),
  qd = A({
    messageId: G,
    partId: G,
    field: P([`text`, `reasoning`, `input`, `output`]).optional(),
    delta: w(),
  }).strict(),
  Jd = A({ part: Qs }).strict(),
  Yd = A({ messageId: G, partId: G, reason: w().optional() }).strict(),
  Xd = A({
    toolCallId: G,
    toolName: w().optional(),
    parentToolCallId: G.optional(),
    source: P([`subagent`]).optional(),
    agentId: G.optional(),
    agentType: G.optional(),
    childSessionId: G.optional(),
    childToolCallId: G.optional(),
    description: w().optional(),
  }).strict(),
  Zd = M(`kind`, [
    Xd.extend({
      kind: F(`scheduled`),
      toolName: G,
      input: O().optional(),
      inputByteLength: E().int().nonnegative().optional(),
      inputOmitted: D().optional(),
      inputRef: F(`model_stream`).optional(),
      dependencies: k(G).optional(),
      parallelGroupIndex: E().int().nonnegative().optional(),
      canRunParallel: D().optional(),
      schedule: K.optional(),
    }).strict(),
    Xd.extend({ kind: F(`started`), startedAt: Du }).strict(),
    Xd.extend({
      kind: F(`progress`),
      elapsedMs: E().nonnegative().optional(),
      pid: E().int().optional(),
      stdoutBytes: E().int().nonnegative().optional(),
      stderrBytes: E().int().nonnegative().optional(),
      outputBytes: E().int().nonnegative().optional(),
      stdoutTail: w().optional(),
      stderrTail: w().optional(),
    }).strict(),
    Xd.extend({ kind: F(`result`), result: ku, duration: E().nonnegative() }).strict(),
    Xd.extend({ kind: F(`error`), error: Nd }).strict(),
    A({
      kind: F(`batch`),
      toolCallIds: k(G),
      successCount: E().int().nonnegative(),
      errorCount: E().int().nonnegative(),
    }).strict(),
    Xd.extend({ kind: F(`raw`), payload: K }).strict(),
  ]),
  Qd = A({
    requestId: G.optional(),
    toolCallId: G,
    toolName: G,
    riskLevel: P([`low`, `medium`, `high`, `critical`]),
    reason: w(),
    input: O(),
    suggestedPermissionUpdates: k(Ps).optional(),
    origin: Us.optional(),
    options: k(Fu).min(1),
  }).strict(),
  $d = A({
    requestId: G.optional(),
    toolCallId: G,
    toolName: G.optional(),
    decision: js.optional(),
    reason: w().optional(),
    modifiedInput: O().optional(),
    inputSummary: O().optional(),
  }).strict(),
  ef = A({
    requestId: G,
    prompt: w(),
    inputType: P([`text`, `choice`, `confirm`]).optional(),
    choices: k(w()).optional(),
  }).strict(),
  tf = A({ requestId: G, value: O().optional(), cancelled: D().optional() }).strict(),
  nf = A({ reason: w().optional() }).strict();
function Y(e, t) {
  return Md.extend({ type: F(e), payload: t.optional() });
}
var rf = M(`type`, [
  Y(`session.created`, Pd),
  Y(`session.resumed`, Fd),
  Y(`session.updated`, K),
  Y(`session.titleUpdated`, Id),
  Y(`session.closed`, nf),
  Y(`turn.started`, Ld),
  Y(`turn.steerQueued`, Vd),
  Y(`turn.steerDrained`, Hd),
  Y(`turn.completed`, Ud),
  Y(`turn.failed`, Wd),
  Y(`message.upserted`, Gd),
  Y(`message.removed`, Kd),
  Y(`part.started`, Jd),
  Y(`part.delta`, qd),
  Y(`part.upserted`, Jd),
  Y(`part.removed`, Yd),
  Y(`model.streaming`, Ad),
  Y(`tool.updated`, Zd),
  Y(`permission.requested`, Qd),
  Y(`permission.resolved`, $d),
  Y(`userInput.requested`, ef),
  Y(`userInput.resolved`, tf),
  Y(`checkpoint.created`, K),
  Y(`rewind.triggered`, K),
  Y(`streamRecovery.updated`, K),
]);
(A({ events: k(rf) }).strict(),
  A({ messages: k($s) }).strict(),
  A({
    type: F(`state.updated`),
    scope: P([`server`, `workspace`, `session`]),
    workspace: B.optional(),
    sessionId: G.optional(),
    revision: E().int().nonnegative(),
    reason: w().optional(),
    patch: O(),
  }).strict(),
  A({
    sessionId: G,
    deliveryKind: Os,
    afterSeq: E().int().nonnegative().optional(),
    includeSnapshot: D().default(!1),
  }).strict(),
  A({
    sessionId: G,
    eventSeq: E().int().nonnegative(),
    events: k(rf),
    snapshot: jd.optional(),
  }).strict(),
  A({ sessions: k(Hs) }).strict());
var af = A({
    childSessionId: G,
    agentId: G.optional(),
    toolCallId: G.optional(),
    subagentType: G,
    title: G,
    summary: w().optional(),
    startedAt: E().int().nonnegative().optional(),
    endedAt: E().int().nonnegative().optional(),
  }).strict(),
  of = af.extend({ status: P([`running`, `waiting`, `blocked`]) }),
  sf = af.extend({ status: P([`success`, `failed`, `cancelled`, `lost`]) });
A({
  revision: E().int().nonnegative(),
  childSessionIds: k(G),
  running: k(of),
  ended: A({ total: E().int().nonnegative(), items: k(sf), nextCursor: G.optional() }).strict(),
}).strict();
var cf = A({
  workspace: B,
  settings: wd,
  modelCatalog: bd.optional(),
  slashCommands: k(Od).optional(),
}).strict();
(A({
  sessionId: G.optional(),
  workspace: B,
  parentSessionId: G.optional(),
  mode: Is.optional(),
  model: V.optional(),
  runtimeModel: J.optional(),
  persistence: Pu.optional(),
  thoughtLevel: G.optional(),
  titleGenerationEnabled: D().optional(),
  mcpServers: k(Ru).optional(),
  toolAllowlist: k(G).optional(),
  toolDenylist: k(G).optional(),
  importedHistory: Hu.optional(),
}).strict(),
  A({
    sessionId: G,
    workspace: B.optional(),
    runtimeModel: J.optional(),
    thoughtLevel: G.optional(),
    mcpServers: k(Ru).optional(),
    toolAllowlist: k(G).optional(),
    toolDenylist: k(G).optional(),
  }).strict(),
  A({
    workspace: B.optional(),
    includeArchived: D().default(!1),
    limit: E().int().positive().optional(),
  }).strict(),
  A({
    sessionId: G,
    endedCursor: G.optional(),
    endedLimit: E().int().positive().max(100).default(20),
  }).strict(),
  A({ range: P(ms), timeZone: w().optional() }).strict(),
  A({ sessionId: G }).strict(),
  A({
    sessionId: G,
    totalTokens: E().int().nonnegative(),
    inputTokens: E().int().nonnegative(),
    outputTokens: E().int().nonnegative(),
    reasoningTokens: E().int().nonnegative(),
    cacheCreationTokens: E().int().nonnegative(),
    cacheReadTokens: E().int().nonnegative(),
    modelRequestCount: E().int().nonnegative(),
    modelErrorCount: E().int().nonnegative(),
    inputBaselineBySource: N(w(), E().int().nonnegative()),
  }).strict(),
  A({
    sessionId: G,
    deliveryKind: Os.optional(),
    messageLimit: E().int().positive().optional(),
    afterSeq: E().int().nonnegative().optional(),
  }).strict(),
  A({
    sessionId: G,
    afterMessageId: G.optional(),
    limit: E().int().positive().optional(),
  }).strict(),
  A({
    sessionId: G,
    afterSeq: E().int().nonnegative().optional(),
    limit: E().int().positive().optional(),
  }).strict(),
  A({ sessionId: G, scope: P([`runtime-materialization`, `user-execution`]) }).strict());
var lf = `preflight-v1`,
  uf = P([`legacy`, `preflight-v1`]);
A({
  nativeSearchEnhancementsEnabled: D(),
  memoryEnabled: D().default(!1),
  askUserQuestionAutoResolutionEnabled: D().default(!0),
  integratedTerminalShell: Jc.optional(),
  modelContextBudgetStrategy: uf.default(lf),
}).strict();
var df = A({
  tabCount: E().int().positive().max(100),
  currentUrl: w().trim().min(1).max(4096).optional(),
}).strict();
(A({
  sessionId: G,
  inputId: G.optional(),
  queryId: G.optional(),
  content: w(),
  attachments: k(K).optional(),
  browserAmbientContext: df.optional(),
  expectedRevision: E().int().nonnegative().optional(),
  expectedProviderRevision: G.optional(),
  expectedModelRuntimeRevision: G.optional(),
  runtimeModel: J.optional(),
  automationId: G.optional(),
  offPeakTaskId: G.optional(),
  offPeakRunType: P([`init`, `resume`]).optional(),
  botDeliveryTarget: sc.optional(),
  toolDenylist: k(G).optional(),
})
  .strict()
  .superRefine((e, t) => {
    (e.automationId &&
      e.offPeakTaskId &&
      t.addIssue({
        code: Ao.custom,
        message: `automationId and offPeakTaskId are mutually exclusive`,
      }),
      e.offPeakRunType &&
        !e.offPeakTaskId &&
        t.addIssue({
          code: Ao.custom,
          message: `offPeakRunType requires offPeakTaskId`,
          path: [`offPeakRunType`],
        }));
  }),
  A({
    sessionId: G,
    accepted: F(!0),
    stateRevision: E().int().nonnegative(),
    modelRuntimeRevision: G.optional(),
  }).strict(),
  A({
    sessionId: G,
    target: M(`kind`, [
      A({ kind: F(`turn`), turnIndex: E().int().nonnegative() }).strict(),
      A({ kind: F(`message`), messageId: G }).strict(),
      A({ kind: F(`checkpoint`), checkpointId: G }).strict(),
      A({ kind: F(`latestCheckpoint`) }).strict(),
    ]).default({ kind: `latestCheckpoint` }),
    expectedRevision: E().int().nonnegative().optional(),
  }).strict(),
  A({
    forkedSessionId: G,
    parentSessionId: G.optional(),
    targetMessageId: G.optional(),
    targetCheckpointId: G.optional(),
    response: w(),
    snapshot: jd,
  }).strict(),
  A({
    sessionId: G,
    inputId: G.optional(),
    instructions: w().optional(),
    expectedRevision: E().int().nonnegative().optional(),
    runtimeModel: J.optional(),
  }).strict(),
  A({
    response: w(),
    snapshot: jd,
    compact: A({
      state: P([`accepted`, `already_running`]),
      inputId: G.optional(),
      operationId: G.optional(),
    })
      .strict()
      .optional(),
  }).strict());
var ff = P([`show`, `set`, `replace`, `pause`, `resume`, `clear`]);
(A({
  sessionId: G,
  inputId: G.optional(),
  action: ff,
  objective: w().optional(),
  expectedRevision: E().int().nonnegative().optional(),
}).strict(),
  A({ response: w(), snapshot: jd, startedTurn: D().optional() }).strict(),
  A({ sessionId: G }).strict());
var pf = P([`running`, `completed`, `failed`, `timed_out`, `cancelled`, `spawn_error`, `lost`]),
  mf = A({
    taskId: G,
    toolCallId: G.optional(),
    toolName: G.optional(),
    taskKind: P([`bash`, `subagent`]).optional(),
    blocked: D().optional(),
    blockedReason: w().optional(),
    cancellable: D().optional(),
    cancelRequestedAt: Du.optional(),
    command: w().optional(),
    description: w().optional(),
    status: pf,
    pid: E().int().positive().optional(),
    startedAt: Du.optional(),
    completedAt: Du.optional(),
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
    terminalId: G.optional(),
  }).strict();
(A({ sessionId: G, taskId: G }).strict(),
  A({
    cancelled: D(),
    reason: w().optional(),
    snapshot: mf.optional(),
    status: pf,
    taskId: G,
  }).strict(),
  A({
    sessionId: G,
    model: V,
    runtimeModel: J.optional(),
    expectedRevision: E().int().nonnegative().optional(),
    persistAsWorkspaceLastUsed: D().default(!0),
  }).strict(),
  A({
    sessionId: G,
    thoughtLevel: G.optional(),
    runtimeModel: J.optional(),
    expectedRevision: E().int().nonnegative().optional(),
    persistAsWorkspaceLastUsed: D().default(!0),
  }).strict(),
  A({ sessionId: G, runtimeModel: J, applyModelSelection: D().default(!0) }).strict(),
  A({ sessionId: G, mode: Is, expectedRevision: E().int().nonnegative().optional() }).strict(),
  A({ sessionId: G, expectedPersistence: Pu.optional() }).strict(),
  A({ closed: D().optional() }).strict(),
  A({ workspace: B, runtimeModel: J.optional(), preferWorkspaceDefaults: D().optional() }).strict(),
  A({
    workspace: B,
    modelRef: V,
    prompt: G,
    querySource: G,
    maxOutputTokens: E().int().positive().optional(),
    temperature: E().min(0).max(2).optional(),
  }).strict(),
  A({ text: w(), modelRef: V }).strict());
var hf = A({ revision: G, generatedAt: q, providers: k($u) }).strict(),
  gf = P([`applied`, `unchanged`, `failed`]);
(A({ workspace: B, registry: hf, includeWorkspaceState: D().optional() }).strict(),
  A({
    workspace: B,
    appliedProviderRevision: G,
    status: gf,
    providerCount: E().int().nonnegative(),
    workspaceState: cf.optional(),
  }).strict(),
  A({
    workspace: B,
    preferences: A({ askUserQuestionAutoResolutionEnabled: D() }).strict(),
  }).strict(),
  A({
    workspace: B,
    askUserQuestionAutoResolutionEnabled: D(),
    snoozedInteractionCount: E().int().nonnegative(),
  }).strict(),
  A({
    workspace: B,
    provider: $u,
    expectedWorkspaceRevision: E().int().nonnegative().optional(),
  }).strict(),
  A({
    workspace: B,
    providerId: G,
    expectedWorkspaceRevision: E().int().nonnegative().optional(),
  }).strict(),
  A({
    workspace: B,
    model: V,
    runtimeModel: J.optional(),
    expectedWorkspaceRevision: E().int().nonnegative().optional(),
  }).strict(),
  A({
    workspace: B,
    thoughtLevel: G,
    expectedWorkspaceRevision: E().int().nonnegative().optional(),
  }).strict(),
  A({
    workspace: B,
    mode: Is,
    expectedWorkspaceRevision: E().int().nonnegative().optional(),
  }).strict(),
  A({
    requestId: G,
    sessionId: G,
    turnId: G.optional(),
    toolCallId: G,
    toolName: G,
    reason: w(),
    riskLevel: P([`low`, `medium`, `high`, `critical`]),
    input: O(),
    origin: Us.optional(),
    options: k(Fu).min(1),
  }).strict(),
  A({
    requestId: G,
    sessionId: G,
    turnId: G.optional(),
    workspaceKey: G,
    workspacePath: G,
    workspaceIdentity: G.optional(),
    remoteSessionId: G.optional(),
    clientMode: Fo,
    sessionContext: Xo,
  }).strict(),
  A({
    requestId: G,
    sessionId: G,
    turnId: G.optional(),
    browserId: G.optional(),
    browserGeneration: E().int().nonnegative().optional(),
    workspaceKey: G.optional(),
    workspacePath: G.optional(),
    workspaceIdentity: G.optional(),
    remoteSessionId: G.optional(),
    clientMode: Fo.optional(),
    sessionContext: Xo.optional(),
    command: Ko,
  }).strict());
var _f = A({
  question: G,
  header: G,
  options: k(
    A({ value: G, label: G, description: w().optional(), preview: w().optional() }).strict(),
  ).min(1),
  multiSelect: D().optional(),
}).strict();
(A({
  requestId: G,
  sessionId: G,
  turnId: G.optional(),
  toolCallId: G.optional(),
  toolName: G.optional(),
  prompt: w().optional(),
  questions: k(_f).min(1).optional(),
  input: O().optional(),
  origin: Us.optional(),
  schema: O().optional(),
}).strict(),
  A({
    action: P([`accept`, `decline`, `cancel`]),
    content: K.optional(),
    reason: w().optional(),
  }).strict());
var vf = P([`model-request`, `captcha-retry`]);
(A({
  requestId: G,
  sessionId: G,
  turnId: G.optional(),
  workspace: B,
  modelRef: V,
  providerId: G,
  reason: vf,
}).strict(),
  A({ headersApplied: D(), errorMessage: G.optional(), providerRevision: G.optional() }).strict());
var yf = j([w(), E(), D()]),
  bf = A({
    event: G,
    matcher: w().optional(),
    type: P([`command`, `process`]),
    command: G,
    args: k(w()).optional(),
    async: D().optional(),
    shell: j([F(!0), w()]).optional(),
    timeout: E().positive().optional(),
    timeoutMs: E().int().positive().optional(),
    statusMessage: w().optional(),
    sourcePath: w(),
    runnable: D(),
  }).strict(),
  xf = A({
    default: yf.optional(),
    description: w().optional(),
    required: D().optional(),
    sensitive: D().optional(),
    title: w().optional(),
    type: P([`string`, `number`, `boolean`, `directory`, `file`]).optional(),
  }).strict(),
  Sf = A({
    kind: P([`agent`, `command`, `skill`, `hook`, `mcp`]),
    items: k(A({ name: G, description: w().optional() }).strict()),
  }).strict(),
  Cf = A({
    id: G,
    name: G,
    description: w().optional(),
    version: w().optional(),
    enabled: D(),
    source: G,
    marketplace: G,
    author: w().optional(),
    authorUrl: w().optional(),
    homepage: w().optional(),
    skillCount: E().int().nonnegative().optional(),
    skillRootCount: E().int().nonnegative(),
    commandRootCount: E().int().nonnegative(),
    components: k(Sf).optional(),
    declaredMcpServerNames: k(w()).optional(),
    hostMcpServerNames: k(w()).optional(),
    mcpServerNames: k(w()),
    hookDetails: k(bf).optional(),
    rootPath: w(),
    userConfig: N(w(), xf).optional(),
    configuredOptions: N(w(), yf).optional(),
  }).strict(),
  wf = A({
    code: w(),
    message: w(),
    severity: P([`warning`, `error`]).optional(),
    pluginId: w().optional(),
  }).strict();
(A({ workspace: B }).strict(), A({ plugins: k(Cf), diagnostics: k(wf) }).strict());
var Tf = A({
  pluginId: G,
  name: G,
  marketplace: G,
  icon: w().optional(),
  enabled: D(),
  conflictingPluginIds: k(G),
  skillQualifiedNames: k(G),
  mcpServerNames: k(G),
  subagentNames: k(G).default([]),
}).strict();
(A({ workspace: B, sessionId: G.optional() }).strict(),
  A({ authority: P([`session`, `workspace`]), plugins: k(Tf) }).strict(),
  A({ workspace: B, pluginId: G, enabled: D() }).strict(),
  A({ plugin: Cf, enabled: D() }).strict());
var Ef = P([`user`, `workspace`]),
  Df = A({
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
    examplePromptsI18n: N(w(), k(w())).optional(),
  }).strict(),
  Of = A({
    id: G,
    name: G,
    source: K,
    description: w().optional(),
    lastUpdated: w().optional(),
    pluginCount: E().int().nonnegative(),
    isOfficial: D().optional(),
    featured: k(w()).optional(),
    refreshFailure: A({ code: w(), failedAt: w(), message: w() }).strict().optional(),
  }).strict(),
  kf = A({
    id: G,
    name: G,
    marketplace: G,
    description: w().optional(),
    version: w().optional(),
    installed: D(),
    componentTypes: k(w()).optional(),
    listing: Df.optional(),
  }).strict(),
  Af = A({
    id: G,
    name: G,
    marketplace: G,
    description: w().optional(),
    version: w().optional(),
    enabled: D(),
    scope: Ef,
    installPath: w().optional(),
    installedAt: w().optional(),
    componentTypes: k(w()).optional(),
    hookDetails: k(bf).optional(),
    updateStatus: P([`none`, `update-available`, `version-changed`]).optional(),
    latestVersion: w().optional(),
    listing: Df.optional(),
  }).strict();
(A({ workspace: B }).strict(),
  A({
    marketplaces: k(Of),
    availablePlugins: k(kf),
    installedPlugins: k(Af),
    restorableBuiltins: k(kf),
    diagnostics: k(wf),
    capability: A({ supported: D(), reason: w().optional() }).strict(),
  }).strict(),
  A({ workspace: B, source: G, dryRun: D().optional(), operationId: G.optional() }).strict(),
  A({ workspace: B, marketplace: G }).strict(),
  A({ workspace: B, marketplace: G.optional() }).strict(),
  A({
    marketplace: Of.optional(),
    marketplaces: k(Of).optional(),
    diagnostics: k(wf).optional(),
  }).strict(),
  A({
    workspace: B,
    pluginName: G,
    marketplace: G,
    scope: Ef.optional(),
    dryRun: D().optional(),
    operationId: G.optional(),
  }).strict(),
  A({ operationId: G }).strict(),
  A({ operationId: G, cancelled: D() }).strict(),
  A({
    workspace: B,
    pluginId: G.optional(),
    pluginName: G.optional(),
    marketplace: G.optional(),
    removeCache: D().optional(),
  }).strict(),
  A({ installedPlugins: k(Af), dependencyClosure: k(w()), diagnostics: k(wf) }).strict(),
  A({ removedPlugin: Af.optional(), diagnostics: k(wf) }).strict(),
  A({ workspace: B, pluginId: G.optional(), marketplace: G.optional() }).strict(),
  A({ workspace: B, pluginId: G }).strict(),
  A({ pluginId: G, diagnostics: k(wf) }).strict(),
  A({ workspace: B, pluginId: G, options: K, dryRun: D().optional() }).strict(),
  A({ pluginId: G, diagnostics: k(wf) }).strict(),
  A({
    workspace: B,
    pluginName: G.optional(),
    marketplace: G.optional(),
    source: G.optional(),
  }).strict(),
  A({
    ok: D(),
    diagnostics: k(wf),
    compatibility: A({ runnable: k(w()), diagnosticOnly: k(w()), unsupported: k(w()) }).strict(),
  }).strict(),
  A({ workspace: B, pluginName: G, marketplace: G }).strict(),
  A({
    components: k(Sf),
    diagnostics: k(wf).optional(),
    metadata: A({
      author: w().optional(),
      authorUrl: w().optional(),
      homepage: w().optional(),
      version: w().optional(),
    })
      .strict()
      .optional(),
  }).strict());
var jf = A({
    unit: P([`minute`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`]),
    interval: E().int().positive(),
    hour: E().int().min(0).max(23),
    minute: E().int().min(0).max(59),
    anchorAt: E().int(),
    weekdays: k(E().int().min(0).max(6)).optional(),
    monthDays: k(E().int().min(1).max(31)).optional(),
    months: k(E().int().min(1).max(12)).optional(),
    monthlyMode: P([`date`, `weekday`]).optional(),
  }).strict(),
  Mf = P([`minute`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`]),
  Nf = A({
    automationId: G,
    title: w(),
    cronExpr: G,
    prompt: G,
    model: w().optional(),
    provider: I.optional(),
    mode: hl.optional(),
    thoughtLevel: G.optional(),
    targetTaskId: G.optional(),
    enabled: D(),
    lifecycleStatus: P([`active`, `completed`, `failed`, `paused`]),
    nextRunAt: q.optional(),
    lastRunAt: q.optional(),
    runCount: E().int().nonnegative(),
    recurring: D(),
    maxRuns: E().int().positive().optional(),
    scheduleRule: jf.optional(),
  }).strict();
(A({
  title: w().optional(),
  cronExpr: G,
  relativeDelayMinutes: E().int().positive().max(525600).optional(),
  prompt: G,
  model: w().optional(),
  provider: I.optional(),
  mode: hl.optional(),
  thoughtLevel: G.optional(),
  targetTaskId: G.optional(),
  botDeliveryTarget: sc.optional(),
  recurring: D().optional(),
  maxRuns: E().int().positive().optional(),
  intervalUnit: Mf.optional(),
  interval: E().int().min(1).max(200).optional(),
})
  .strict()
  .refine((e) => (e.intervalUnit === void 0) == (e.interval === void 0), {
    message: `intervalUnit and interval must be set together`,
    path: [`interval`],
  })
  .refine((e) => e.intervalUnit === void 0 || e.relativeDelayMinutes === void 0, {
    message: `intervalUnit cannot combine with a relative delayMinutes`,
    path: [`intervalUnit`],
  })
  .refine((e) => e.intervalUnit === void 0 || e.recurring !== !1, {
    message: `intervalUnit is a recurring carrier and cannot combine with recurring=false`,
    path: [`recurring`],
  })
  .refine((e) => e.intervalUnit === void 0 || e.maxRuns === void 0, {
    message: `intervalUnit is a recurring carrier and cannot combine with maxRuns`,
    path: [`maxRuns`],
  }),
  A({ automation: Nf }).strict(),
  A({
    automationId: G,
    title: G.optional(),
    cronExpr: G.optional(),
    prompt: G.optional(),
    recurring: D().optional(),
    maxRuns: E().int().positive().nullable().optional(),
    intervalUnit: Mf.optional(),
    interval: E().int().min(1).max(200).optional(),
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
      { message: `automation update requires at least one field` },
    )
    .refine((e) => e.maxRuns !== null || e.recurring === !0, {
      message: `clearing maxRuns requires recurring=true`,
      path: [`maxRuns`],
    })
    .refine((e) => e.recurring !== !0 || typeof e.maxRuns != `number`, {
      message: `recurring=true cannot be combined with a numeric maxRuns`,
      path: [`maxRuns`],
    })
    .refine((e) => (e.intervalUnit === void 0) == (e.interval === void 0), {
      message: `intervalUnit and interval must be set together`,
      path: [`interval`],
    })
    .refine((e) => e.intervalUnit === void 0 || e.recurring !== !1, {
      message: `intervalUnit is a recurring carrier and cannot combine with recurring=false`,
      path: [`recurring`],
    })
    .refine(
      (e) =>
        e.intervalUnit === void 0 ||
        e.maxRuns === void 0 ||
        (e.maxRuns === null && e.recurring === !0),
      {
        message: `intervalUnit is a recurring carrier and only allows maxRuns=null with recurring=true`,
        path: [`maxRuns`],
      },
    ),
  A({ automation: Nf }).strict(),
  A({}).strict(),
  A({ automations: k(Nf) }).strict(),
  A({ targetTaskId: G }).strict(),
  A({ bound: D() }).strict(),
  A({ automationId: G }).strict(),
  A({ deleted: D() }).strict());
var Pf = {
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
  interactionBrowserExecute: `interaction/browserExecute`,
};
(A({}).strict(), Pf.mcpList, Pf.interactionBrowserList, Pf.interactionBrowserExecute);
var Ff = A({ rowId: E().int().nonnegative(), entityId: w().trim().min(1) }).strict(),
  If = E(),
  Lf = P([`text`, `inputText`, `output.text`, `summaryText`]),
  Rf = {
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
  },
  zf = w()
    .min(4)
    .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u);
function Bf(e) {
  let t = 4294967295;
  for (let n of e) {
    t ^= n;
    for (let e = 0; e < 8; e += 1) t = (t >>> 1) ^ (t & 1 ? 3988292384 : 0);
  }
  return ((t ^ 4294967295) >>> 0).toString(16).padStart(8, `0`);
}
var Vf = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
function Hf(e) {
  let t = ``,
    n = [];
  for (let r = 0; r < e.byteLength; r += 3) {
    let i = e[r] ?? 0,
      a = r + 1 < e.byteLength,
      o = r + 2 < e.byteLength,
      s = a ? (e[r + 1] ?? 0) : 0,
      c = o ? (e[r + 2] ?? 0) : 0;
    (n.push(
      Vf[i >>> 2],
      Vf[((i & 3) << 4) | (s >>> 4)],
      a ? Vf[((s & 15) << 2) | (c >>> 6)] : `=`,
      o ? Vf[c & 63] : `=`,
    ),
      n.length >= 16384 && ((t += n.join(``)), (n = [])));
  }
  return t + n.join(``);
}
function Uf(e) {
  if (!zf.safeParse(e).success) return null;
  let t = e.endsWith(`==`) ? 2 : +!!e.endsWith(`=`),
    n = new Uint8Array((e.length / 4) * 3 - t),
    r = 0;
  for (let t = 0; t < e.length; t += 4) {
    let i = Vf.indexOf(e[t]),
      a = Vf.indexOf(e[t + 1]),
      o = e[t + 2] === `=` ? 0 : Vf.indexOf(e[t + 2]),
      s = e[t + 3] === `=` ? 0 : Vf.indexOf(e[t + 3]);
    if (i < 0 || a < 0 || o < 0 || s < 0) return null;
    let c = (i << 18) | (a << 12) | (o << 6) | s;
    (r < n.length && (n[r++] = c >>> 16),
      r < n.length && (n[r++] = (c >>> 8) & 255),
      r < n.length && (n[r++] = c & 255));
  }
  return n;
}
var Wf = {
    maxPhysicalFrameBytes: Rf.maxFrameBytes,
    maxMessageBytes: 16 * 1024 * 1024,
    maxFragments: 64,
    assemblyTimeoutMs: 3e4,
    transportIdMaxChars: Rf.transportEnvelopeIdMaxChars,
  },
  Gf = E()
    .int()
    .positive()
    .max(2 ** 53 - 1),
  Kf = E()
    .int()
    .nonnegative()
    .max(2 ** 53 - 1),
  qf = w()
    .min(1)
    .max(Wf.transportIdMaxChars)
    .regex(/^[A-Za-z0-9._~-]+$/u);
A({ bridgeSessionId: qf, bridgeGeneration: Kf.optional(), recoveryId: qf.optional() }).strict();
var Jf = A({ algorithm: F(`crc32`), value: w().regex(/^[0-9a-f]{8}$/u) }).strict();
function Yf(e) {
  if (e.length < 4 || e.length > Wf.maxPhysicalFrameBytes) return !1;
  let t = Uf(e);
  return t !== null && t.byteLength > 0 && Hf(t) === e;
}
var Xf = A({
    zcode_type: F(`rpc-frame`),
    bridgeSessionId: qf,
    bridgeGeneration: Kf.optional(),
    recoveryId: qf.optional(),
    seq: Gf,
    messageSeq: Gf,
    fragmentIndex: E()
      .int()
      .nonnegative()
      .max(Wf.maxFragments - 1),
    fragmentCount: E().int().positive().max(Wf.maxFragments),
    messageBytes: E().int().positive().max(Wf.maxMessageBytes),
    checksum: Jf,
    dataBase64: w().min(4).max(Wf.maxPhysicalFrameBytes).refine(Yf),
  })
    .strict()
    .superRefine((e, t) => {
      (e.fragmentIndex >= e.fragmentCount &&
        t.addIssue({
          code: `custom`,
          path: [`fragmentIndex`],
          message: `fragmentIndex must be smaller than fragmentCount`,
        }),
        e.fragmentCount > e.messageBytes &&
          t.addIssue({
            code: `custom`,
            path: [`fragmentCount`],
            message: `non-empty fragments cannot exceed message bytes`,
          }));
    }),
  Zf = A({
    zcode_type: F(`rpc-frame-ack`),
    bridgeSessionId: qf,
    bridgeGeneration: Kf.optional(),
    recoveryId: qf.optional(),
    ackMessageSeq: Gf,
  }).strict(),
  Qf = j([Xf, Zf]);
A({ type: F(`data`), payload: Qf, client_ts: Kf.optional(), server_ts: Kf.optional() }).strict();
var X = w().trim().min(1),
  $f = [
    `default`,
    `yolo`,
    `plan`,
    `edit`,
    `acceptEdits`,
    `auto`,
    `dontAsk`,
    `bypassPermissions`,
    `autoEdit`,
    `build`,
  ],
  ep = [`claude`, `opencode`, `gemini`, `codex`, `glm`],
  tp = [`claudeCode`],
  np = A({
    fileCount: E().int().nonnegative(),
    added: E().int().nonnegative(),
    removed: E().int().nonnegative(),
    files: k(
      A({
        path: w(),
        added: E().int().nonnegative(),
        removed: E().int().nonnegative(),
        writeCount: E().int().positive(),
        lastTurnIndex: E().int().nonnegative(),
      }).strict(),
    ),
  }).strict(),
  rp = A({
    taskId: X,
    traceId: X,
    title: w(),
    titleOverridden: D().optional(),
    workspacePath: X,
    workspaceIdentity: X.optional(),
    createdAt: E().int().nonnegative(),
    updatedAt: E().int().nonnegative(),
    mode: P($f),
    model: w().optional(),
    runtimeEpoch: E().int().nonnegative().optional(),
    provider: P(ep).optional(),
    migrationSource: P(tp).optional(),
    forkedFromTaskId: X.optional(),
    unreadAt: E().int().nonnegative().optional(),
    status: P([`running`, `completed`, `error`]).optional(),
    lastError: A({
      code: w().optional(),
      message: w().min(1),
      traceId: X.optional(),
      taskId: X.optional(),
    }).optional(),
    changeSummary: np.optional(),
  });
function ip(e) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}
var ap = P([
    `task_created`,
    `user_message_saved`,
    `assistant_message_saved`,
    `task_status_changed`,
    `task_meta_changed`,
    `task_model_changed`,
    `task_title_changed`,
    `task_pinned`,
    `task_unpinned`,
    `task_archived`,
    `task_unarchived`,
    `task_deleted`,
    `stream_mirror_gap`,
    `stream_mirror_owner_lost`,
  ]),
  op = P([`observer`, `relay_owner`]),
  sp = P([`desktop_window`, `relay_bridge`]),
  cp = A({
    eventId: X,
    workspacePath: X,
    workspaceIdentity: X.optional(),
    workspaceKey: X,
    traceId: X,
    createdAt: E().int().nonnegative(),
  }).strict(),
  lp = A({ runId: X, opSeq: E().int().nonnegative() }).strict(),
  up = cp.extend({ reason: ap, streamWatermark: lp.optional() }).strict(),
  dp = (e, t) => {
    let n = ip(t);
    t.workspaceKey !== n &&
      e.addIssue({
        code: Ao.custom,
        path: [`workspaceKey`],
        message: `workspaceKey must match workspaceIdentity fallback rule`,
      });
  },
  fp = (e, t) => {
    t.runId !== t.traceId &&
      e.addIssue({ code: Ao.custom, path: [`runId`], message: `runId must match traceId` });
  },
  pp = up.extend({ type: F(`task_snapshot_invalidated`), taskId: X }).strict(),
  mp = up
    .extend({
      type: F(`workspace_task_list_invalidated`),
      taskId: X.optional(),
      taskMeta: rp.optional(),
    })
    .strict(),
  hp = M(`kind`, [
    A({
      kind: F(`image`),
      filename: w(),
      mimeType: w(),
      sizeBytes: E().int().nonnegative().optional(),
      dataBase64: w().optional(),
      localPath: w().optional(),
    }).strict(),
    A({
      kind: F(`audio`),
      filename: w(),
      mimeType: w(),
      dataBase64: w().optional(),
      localPath: w().optional(),
    }).strict(),
    A({
      kind: F(`file`),
      filename: w(),
      mimeType: w(),
      sizeBytes: E().int().nonnegative(),
      dataBase64: w().optional(),
      textContent: w().optional(),
      localPath: w().optional(),
    }).strict(),
  ]),
  gp = A({ type: X, taskId: X, traceId: X }).passthrough(),
  _p = A({
    kind: F(`user_message`),
    messageId: X,
    content: w(),
    attachments: k(hp).optional(),
    timestamp: E().finite(),
  }).strict(),
  vp = A({ kind: F(`stream_event`), event: gp }).strict(),
  yp = M(`kind`, [_p, vp]),
  bp = M(`kind`, [
    _p.extend({ seq: E().int().positive() }).strict(),
    vp.extend({ seq: E().int().positive() }).strict(),
  ]),
  xp = A({
    workspacePath: X,
    workspaceIdentity: X.optional(),
    workspaceKey: X,
    taskId: X,
    runId: X,
    traceId: X,
    ownerClientId: X.optional(),
    ownerDeviceLabel: X.optional(),
  }).strict(),
  Sp = xp.superRefine((e, t) => {
    (dp(t, e), fp(t, e));
  }),
  Cp = cp
    .extend({
      type: F(`task_stream_mirror_batch`),
      taskId: X,
      runId: X,
      ownerClientId: X.optional(),
      ownerDeviceLabel: X.optional(),
      batchSeq: E().int().positive(),
      fromSeq: E().int().positive(),
      toSeq: E().int().positive(),
      ops: k(bp),
      terminal: D(),
    })
    .strict(),
  wp = Sp,
  Tp = xp
    .extend({ leaseRequestId: X })
    .strict()
    .superRefine((e, t) => {
      (dp(t, e), fp(t, e));
    }),
  Ep = M(`acquired`, [
    A({ leaseRequestId: X, acquired: F(!0), ownerHostId: X }).strict(),
    A({
      leaseRequestId: X,
      acquired: F(!1),
      ownerHostId: X,
      reason: F(`owned_by_other_host`),
    }).strict(),
  ]),
  Dp = A({
    commandRequestId: X,
    workspacePath: X,
    workspaceIdentity: X.optional(),
    workspaceKey: X,
    taskId: X,
    runId: X,
  }).strict(),
  Op = Dp.extend({ type: F(`stop_generation`) }).strict(),
  kp = Dp.extend({
    type: F(`respond_permission`),
    permissionRequestId: X,
    optionId: X,
    response: Fs,
  }).strict(),
  Ap = Dp.extend({
    type: F(`respond_elicitation`),
    elicitationRequestId: X,
    action: P([`accept`, `decline`, `cancel`]),
    content: N(w(), O()).optional(),
  }).strict(),
  jp = M(`type`, [
    A({
      commandId: X,
      taskId: X,
      traceId: X,
      workspacePath: X,
      workspaceIdentity: X.optional(),
      workspaceKey: X,
      status: P([`accepted`, `running`, `failed`]),
      createdAt: E().int().nonnegative(),
      updatedAt: E().int().nonnegative(),
      clientId: X.optional(),
      clientLabel: X.optional(),
      error: w().optional(),
    })
      .strict()
      .extend({
        type: F(`send_prompt`),
        content: w(),
        attachments: k(hp).optional(),
        automationId: X.optional(),
      })
      .strict(),
  ]),
  Mp = Dp.extend({ type: F(`enqueue_task_command`), taskCommand: jp }).strict(),
  Np = Dp.extend({
    type: F(`promote_task_command`),
    commandId: X,
    clientMode: F(`web-remote-replayable`),
  }).strict(),
  Pp = Dp.extend({
    type: F(`cancel_task_command`),
    commandId: X,
    clientMode: F(`web-remote-replayable`),
  }).strict(),
  Fp = M(`type`, [Op, kp, Ap, Mp, Np, Pp]).superRefine((e, t) => {
    dp(t, e);
  }),
  Ip = M(`type`, [
    Op.extend({ requesterHostId: X }).strict(),
    kp.extend({ requesterHostId: X }).strict(),
    Ap.extend({ requesterHostId: X }).strict(),
    Mp.extend({ requesterHostId: X }).strict(),
    Np.extend({ requesterHostId: X }).strict(),
    Pp.extend({ requesterHostId: X }).strict(),
  ]).superRefine((e, t) => {
    dp(t, e);
  }),
  Lp = P([`NO_ACTIVE_TASK_OWNER`, `STALE_TASK_OWNER_COMMAND`, `OWNER_COMMAND_FAILED`]),
  Rp = M(`success`, [
    A({ commandRequestId: X, success: F(!0), taskCommand: jp.optional() }).strict(),
    A({ commandRequestId: X, success: F(!1), error: w(), code: Lp.optional() }).strict(),
  ]),
  zp = M(`type`, [pp, mp, Cp]).superRefine((e, t) => {
    (dp(t, e), e.type === `task_stream_mirror_batch` && fp(t, e));
  }),
  Bp = M(`type`, [
    pp.extend({ originHostId: X, deliveryPurpose: op.optional() }).strict(),
    mp.extend({ originHostId: X, deliveryPurpose: op.optional() }).strict(),
    Cp.extend({ originHostId: X, deliveryPurpose: op.optional() }).strict(),
  ]).superRefine((e, t) => {
    (dp(t, e), e.type === `task_stream_mirror_batch` && fp(t, e));
  }),
  Z = w().trim().min(1),
  Q = Z.max(Rf.transportEnvelopeIdMaxChars).regex(/^[A-Za-z0-9._~-]+$/u),
  Vp = k(
    A({
      workspacePath: Z,
      workspaceIdentity: Z.optional(),
      remoteSessionId: Z.optional(),
      label: Z,
      workspacePurpose: P([`project`, `conversation`]).optional(),
      kind: P([`local`, `remote`]),
      connectionState: P([`connected`, `disconnected`, `reconnecting`]).optional(),
      lastConnectionError: w().optional(),
    }),
  );
(A({ requestId: Z, workspaceKey: Z }),
  j([
    A({ requestId: Z, workspaceKey: Z, success: F(!0) }),
    A({ requestId: Z, workspaceKey: Z, success: F(!1), error: w() }),
  ]));
var Hp = k(
    A({
      taskId: Z,
      title: w(),
      workspacePath: Z,
      workspaceIdentity: Z.optional(),
      remoteSessionId: Z.optional(),
      workspaceLabel: Z,
      workspaceKind: P([`local`, `remote`]),
      createdAt: E().finite(),
      updatedAt: E().finite(),
      provider: I.optional(),
      unreadAt: E().finite().optional(),
      displayStatus: P([`idle`, `running`, `completed`, `error`]).optional(),
      pinned: D().optional(),
      archived: D().optional(),
    }),
  ),
  Up = P([
    `session-not-found`,
    `session-expired`,
    `session-conflict`,
    `workspace-closed`,
    `desktop-disconnected`,
    `invalid-mobile-connection`,
    `desktop-bootstrap-timeout`,
    `connection-recovery-timeout`,
    `relay-unavailable`,
    `unsupported-action`,
    `unexpected-error`,
  ]),
  Wp = M(`kind`, [
    A({
      bridgeSessionId: Q,
      bridgeGeneration: E().int().nonnegative().optional(),
      recoveryId: Q.optional(),
      kind: F(`local`),
      workspaceKey: Z,
      workspacePath: Z,
      initialTaskId: Z.optional(),
    }),
    A({
      bridgeSessionId: Q,
      bridgeGeneration: E().int().nonnegative().optional(),
      recoveryId: Q.optional(),
      kind: F(`remote`),
      workspaceKey: Z,
      workspacePath: Z,
      workspaceIdentity: Z,
      remoteSessionId: Z,
      initialTaskId: Z.optional(),
    }),
  ]),
  Gp = A({ activeWorkspaceKey: Z.optional(), activeTaskId: Z.optional(), updatedAt: E().finite() }),
  Kp = A({
    platform: Z,
    version: Z,
    name: Z,
    userAgent: w().optional(),
    language: w().optional(),
    languages: k(w()).optional(),
    browserPlatform: w().optional(),
    viewport: A({
      width: E().finite(),
      height: E().finite(),
      devicePixelRatio: E().finite(),
    }).optional(),
    screen: A({ width: E().finite(), height: E().finite() }).optional(),
    timezone: w().optional(),
    online: D().optional(),
    updatedAt: E().finite(),
  }),
  qp = A({
    windowControlSessionId: Z,
    workspaces: Vp,
    tasks: Hp,
    initialViewState: Gp.optional(),
    mobileViewState: Gp.optional(),
  }),
  Jp = A({
    workspaces: Vp,
    tasks: Hp.optional(),
    activeWorkspaceKey: Z.optional(),
    activeTaskId: Z.optional(),
  }),
  Yp = P([
    `isDockerAvailable`,
    `listWSLDistros`,
    `listDockerContainers`,
    `listSSHConfigAliases`,
    `loadMcpFromUserDirectory`,
    `saveMcpToUserDirectory`,
    `migrateLegacyCommonMcp`,
  ]);
(j([
  A({ zcode_type: F(`bootstrap-request`), requestId: Z }),
  A({ zcode_type: F(`bootstrap-response`), requestId: Z, success: F(!0), result: qp }),
  A({ zcode_type: F(`workspace-list-request`), requestId: Z }),
  A({ zcode_type: F(`workspace-list-response`), requestId: Z, success: F(!0), result: Jp }),
  A({ zcode_type: F(`workspace-list-updated`), result: Jp }),
  A({
    zcode_type: F(`workspace-bridge-open`),
    requestId: Z,
    bridgeSessionId: Q,
    bridgeGeneration: E().int().nonnegative().optional(),
    recoveryId: Q.optional(),
    workspaceKey: Z,
    taskId: Z.optional(),
  }),
  A({
    zcode_type: F(`workspace-bridge-ready`),
    requestId: Z,
    bridgeSessionId: Q,
    bridgeGeneration: E().int().nonnegative().optional(),
    recoveryId: Q.optional(),
    bridge: Wp,
  }),
  A({
    zcode_type: F(`workspace-bridge-error`),
    requestId: Z,
    bridgeSessionId: Q.optional(),
    bridgeGeneration: E().int().nonnegative().optional(),
    recoveryId: Q.optional(),
    reason: Up,
    error: w(),
  }),
  A({ zcode_type: F(`workspace-reconnect-request`), requestId: Z, workspaceKey: Z }),
  A({
    zcode_type: F(`workspace-reconnect-response`),
    requestId: Z,
    workspaceKey: Z,
    success: F(!0),
  }),
  A({
    zcode_type: F(`workspace-reconnect-response`),
    requestId: Z,
    workspaceKey: Z,
    success: F(!1),
    error: w(),
  }),
  A({ zcode_type: F(`mobile-view-state-update`), viewState: Gp, deviceInfo: Kp.optional() }),
  A({ zcode_type: F(`platform-request`), requestId: Z, method: Yp, args: O().optional() }),
  A({ zcode_type: F(`platform-response`), requestId: Z, method: Yp, success: F(!0), result: O() }),
  A({ zcode_type: F(`platform-response`), requestId: Z, method: Yp, success: F(!1), error: w() }),
  Xf,
  Zf,
  A({
    zcode_type: F(`bridge-degraded`),
    bridgeSessionId: Q,
    bridgeGeneration: E().int().nonnegative().optional(),
    recoveryId: Q.optional(),
    reason: P([`rpc-transport-fault`, `rpc-frame-gap`, `buffer-overflow`, `buffer-timeout`]),
    seq: E().int().nonnegative().optional(),
    expectedSeq: E().int().nonnegative().optional(),
    droppedCount: E().int().nonnegative().optional(),
  }),
  A({
    zcode_type: F(`app-error`),
    requestId: Z.optional(),
    bridgeSessionId: Q.optional(),
    reason: Up,
    error: w(),
  }),
  A({
    zcode_type: F(`mobile-diagnostic`),
    event: P([
      `state-transition`,
      `socket-close`,
      `socket-error`,
      `recover-start`,
      `recover-scheduled`,
      `pair-status`,
      `failure`,
    ]),
    timestamp: E().int().nonnegative(),
    state: w().optional(),
    previousState: w().optional(),
    pairStatus: P([`waiting`, `matched`]).optional(),
    closeCode: E().int().optional(),
    closeReason: w().optional(),
    wasClean: D().optional(),
    wasPaired: D().optional(),
    failureReason: Up.optional(),
    failureMessage: w().optional(),
    visibilityState: w().optional(),
    online: D().optional(),
    hiddenDurationMs: E().int().nonnegative().optional(),
  }),
]),
  N(w(), w()));
var Xp = A({
    kind: F(`ssh`),
    host: Z,
    port: E().int().positive().max(65535).optional(),
    username: Z,
    sshConfigAlias: Z.optional(),
    password: w().optional(),
    privateKeyPath: w().optional(),
    privateKeyPassphrase: w().optional(),
    assetInstallMode: P(os).optional(),
    resourcePackages: A({ selectedPackageIds: k(w().refine(ps)).optional() }).optional(),
  }),
  Zp = A({ kind: F(`wsl`), distro: w().optional(), user: Tc.optional() }),
  Qp = M(`kind`, [
    Xp,
    Zp,
    A({ kind: F(`docker`), container: Z }),
    A({
      kind: F(`server`),
      url: w().url(),
      name: Z.optional(),
      token: w().optional(),
      workspacePath: w().optional(),
      serverId: Z.optional(),
    }),
  ]);
(A({ type: F(`zcode-hello`), version: w(), platform: w(), arch: w(), pid: E().int() }),
  A({ type: F(`zcode-hello-ack`), version: w(), clientId: Z }),
  A({ level: P([`info`, `warn`, `error`]), args: k(O()) }),
  A({
    taskId: Z,
    status: P([
      `completed`,
      `failed`,
      `permission_request`,
      `elicitation_request`,
      `feedback_update`,
    ]),
    requestId: Z.optional(),
    title: w(),
    body: w(),
  }),
  A({
    context: A({ clientTimezone: Z, clientLanguage: Z, screenResolution: Z }),
    elementName: Z,
    eventRegion: Z,
    eventType: Z,
    eventText: w().optional(),
    eventExtraDetail: N(w(), w()),
    userId: w().optional(),
    talkId: w().optional(),
    messageId: w().optional(),
  }),
  A({
    name: Z,
    group: Z,
    value: E().finite().optional(),
    properties: N(w(), j([w(), E().finite(), D(), Ua()])).optional(),
  }));
var $p = A({ channel: Z, payload: O(), sourceWindowId: E().int().optional() }),
  em = A({
    mockCdnDir: w().optional(),
    remoteCdnBaseUrl: w().optional(),
    remoteCdnBaseUrls: k(w()).optional(),
    remoteCacheDir: w().optional(),
  }),
  tm = A({ workspacePath: Z, workspaceIdentity: Z.optional() }),
  nm = A({
    type: F(`init-local`),
    hostId: Z.optional(),
    deliveryKind: sp.optional(),
    deviceMid: w().optional(),
    feedbackApiBase: w().url().optional(),
    workspacePath: Z.optional(),
    workspaceIdentity: Z.optional(),
    agentWarmupTargets: k(tm).max(3).optional(),
    agentSpawnFallbackCwd: Z.optional(),
    runtimeProcessEnvPatch: N(w().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), w()).optional(),
  }),
  rm = A({ type: F(`init-remote`), target: Qp, remoteAssets: em }),
  im = A({
    type: F(`init-remote-workspace`),
    target: Qp,
    remoteAssets: em,
    workspacePath: Z.optional(),
    workspaceIdentity: Z.optional(),
    hostId: Z.optional(),
    deliveryKind: sp.optional(),
  }),
  am = A({
    type: F(`init-remote-ssh-host`),
    target: Xp,
    remoteAssets: em,
    hostId: Z.optional(),
    deliveryKind: sp.optional(),
  }),
  om = A({
    type: F(`init-remote-wsl-host`),
    target: Zp,
    remoteAssets: em,
    hostId: Z.optional(),
    deliveryKind: sp.optional(),
  }),
  sm = A({
    type: F(`attach-service-port`),
    attachmentId: Z,
    clientMode: P([`desktop-continuous`, `web-remote-replayable`]),
  }).strict(),
  cm = A({ type: F(`detach-service-port`), attachmentId: Z }),
  lm = A({
    type: F(`acquire-remote-workspace`),
    requestId: Z,
    workspacePath: Z,
    workspaceIdentity: Z.optional(),
    generation: E().int().positive(),
  }),
  um = A({
    type: F(`release-remote-workspace`),
    workspacePath: Z,
    workspaceIdentity: Z.optional(),
    generation: E().int().positive(),
  }),
  dm = A({ type: F(`dispose`) }),
  fm = A({ type: F(`broadcast`), message: $p }),
  pm = A({ type: F(`task-realtime-deliver`), event: Bp }),
  mm = A({ type: F(`task-run-lease-result`), result: Ep }),
  hm = A({ type: F(`task-owner-command-deliver`), command: Ip }),
  gm = A({ type: F(`task-owner-command-result`), result: Rp }),
  _m = A({
    type: F(`bot-remote-workspace-reconnect-result`),
    requestId: Z,
    ok: D(),
    sessionId: Z.optional(),
    error: w().optional(),
  }),
  vm = A({
    type: F(`bot-remote-workspace-connection-status-result`),
    requestId: Z,
    ok: D(),
    connected: D().optional(),
    error: w().optional(),
  }),
  ym = A({
    type: F(`bot-remote-workspace-runtime-port`),
    requestId: Z,
    ok: D(),
    error: w().optional(),
  }),
  bm = A({
    content: Z,
    createdAt: Z,
    fromSessionId: Z,
    messageId: Z,
    requestId: Z,
    toSessionId: Z,
  }),
  xm = A({
    error: w().optional(),
    messageId: Z,
    requestId: Z,
    sessionId: Z,
    status: P([`success`, `failed`]),
  }),
  Sm = A({ sessionId: Z });
M(`type`, [
  nm,
  rm,
  im,
  am,
  om,
  sm,
  cm,
  lm,
  um,
  dm,
  fm,
  pm,
  mm,
  hm,
  gm,
  _m,
  vm,
  ym,
  A({ type: F(`session-message-deliver`), request: bm }),
  A({ type: F(`session-message-delivery-result`), result: xm }),
  A({
    type: F(`feedback-log-archive-result`),
    requestId: Z,
    ok: D(),
    path: w().optional(),
    size: E().int().nonnegative().optional(),
    error: w().optional(),
  }),
  A({
    type: F(`cron-run`),
    automationId: Z,
    runId: Z,
    workspacePath: Z,
    workspaceIdentity: w().optional(),
    prompt: Z,
    targetTaskId: Z.optional(),
    model: w().optional(),
    provider: w().optional(),
    mode: w().optional(),
    thoughtLevel: w().optional(),
  }),
  A({
    type: F(`off-peak-run`),
    offPeakTaskId: Z,
    workspacePath: Z,
    workspaceIdentity: w().optional(),
    prompt: Z,
    permissionMode: Z,
    model: w().optional(),
    thoughtLevel: w().optional(),
    conversationId: w().optional(),
    sessionId: w().optional(),
    serverTicketId: w().optional(),
  }),
  A({ type: F(`browser-execute-result`), requestId: Z, result: as }),
]);
var Cm = A({ type: F(`connected`) }),
  wm = A({
    type: F(`remote-workspace-acquired`),
    requestId: Z,
    workspacePath: Z,
    workspaceIdentity: Z.optional(),
    generation: E().int().positive(),
    ok: D(),
    error: w().optional(),
  }),
  Tm = A({ type: F(`error`), error: w() }),
  Em = A({ type: F(`log`), level: P([`info`, `warn`, `error`]), source: w(), message: w() }),
  Dm = P([`claudeCode`]),
  Om = A({
    type: F(`agent-process-spawned`),
    pid: E().int().positive(),
    provider: I,
    workspacePath: Z,
    command: w(),
    args: k(w()),
    startedAt: E().int().nonnegative(),
    runtimeGeneration: E().int().positive().optional(),
    runtimeInstanceId: Z.optional(),
  }),
  km = A({
    type: F(`agent-process-ready`),
    pid: E().int().positive(),
    provider: I,
    workspacePath: Z,
    readyAt: E().int().nonnegative(),
    startupDurationMs: E().int().nonnegative(),
    runtimeGeneration: E().int().positive(),
    runtimeInstanceId: Z,
  }),
  Am = A({
    type: F(`agent-process-exited`),
    pid: E().int().positive(),
    provider: I,
    workspacePath: Z,
    exitCode: E().int().nullable(),
    signal: w().nullable(),
    endedAt: E().int().nonnegative(),
    terminationKind: P([`expected`, `unexpected`, `watchdog_recycle`]),
    terminationReason: w().optional(),
    runtimeReady: D().optional(),
    runtimeGeneration: E().int().positive(),
    runtimeInstanceId: Z.optional(),
    uptimeMs: E().int().nonnegative(),
    stderrLineCount: E().int().nonnegative(),
    stderrTail: k(w().max(1100)).max(20).optional(),
  }),
  jm = A({
    type: F(`agent-process-error`),
    pid: E().int().positive().nullable(),
    provider: I,
    workspacePath: Z,
    command: w(),
    args: k(w()),
    errorName: Z,
    errorCode: w().optional(),
    errorMessage: w(),
    errorStack: w().optional(),
    runtimeGeneration: E().int().positive(),
    runtimeInstanceId: Z.optional(),
    occurredAt: E().int().nonnegative(),
  }),
  Mm = A({
    type: F(`agent-resource-sample`),
    runtimeSurface: P([`local`, `remote`]),
    sample: Mu,
  }).strict(),
  Nm = A({
    type: F(`agent-running-task-count-changed`),
    runningTaskCount: E().int().nonnegative(),
  }),
  Pm = A({
    type: F(`workspace-running-task-count-changed`),
    workspacePath: Z,
    workspaceIdentity: Z.optional(),
    runningTaskCount: E().int().nonnegative(),
  }),
  Fm = A({
    type: F(`repo-wiki-running-task-count-changed`),
    runningTaskCount: E().int().nonnegative(),
  }),
  Im = A({ type: F(`task-realtime-publish`), event: zp }),
  Lm = A({ type: F(`task-stream-op-publish`), target: Sp, op: yp }),
  Rm = A({ type: F(`task-run-lease-acquire`), request: Tp }),
  zm = A({ type: F(`task-run-lease-release`), target: wp }),
  Bm = A({ type: F(`task-owner-command-request`), command: Fp }),
  Vm = A({ type: F(`task-owner-command-result`), result: Rp }),
  Hm = A({
    type: F(`bot-remote-workspace-reconnect-request`),
    requestId: Z,
    workspacePath: Z,
    workspaceIdentity: Z,
    target: Qp,
  }),
  Um = A({
    type: F(`bot-remote-workspace-connection-status-request`),
    requestId: Z,
    workspacePath: Z,
    workspaceIdentity: Z,
    target: Qp,
  }),
  Wm = A({
    type: F(`bot-remote-workspace-runtime-port-request`),
    requestId: Z,
    workspacePath: Z,
    workspaceIdentity: Z,
    target: Qp,
  }),
  Gm = A({ type: F(`session-message-send-requested`), request: bm }),
  Km = A({ type: F(`session-route-announce`), route: Sm }),
  qm = A({ type: F(`session-message-deliver-result`), result: xm }),
  Jm = A({ type: F(`feedback-log-archive-request`), requestId: Z, sourceDir: Z }),
  Ym = A({
    type: F(`cron-run-result`),
    runId: Z,
    ok: D(),
    taskId: w().optional(),
    sessionId: w().optional(),
    error: w().optional(),
    failureKind: P([`transient`, `permanent`]).optional(),
  }),
  Xm = A({
    type: F(`off-peak-run-result`),
    offPeakTaskId: Z,
    ok: D(),
    conversationId: w().optional(),
    sessionId: w().optional(),
    error: w().optional(),
    failureKind: P([`transient`, `permanent`]).optional(),
  }),
  Zm = A({ type: F(`cron-scheduler-wake-request`), automationId: Z }),
  Qm = A({ type: F(`off-peak-scheduler-wake-request`), offPeakTaskId: w().optional() }),
  $m = A({
    type: F(`browser-execute-request`),
    requestId: Z,
    browserId: Z.optional(),
    browserGeneration: E().int().nonnegative().optional(),
    sessionId: Z,
    turnId: Z.optional(),
    workspaceKey: Z.optional(),
    workspacePath: Z.optional(),
    workspaceIdentity: Z.optional(),
    remoteSessionId: Z.optional(),
    clientMode: P([`desktop-continuous`, `web-remote-replayable`]).optional(),
    sessionContext: P([`live`, `cached`]).optional(),
    command: Ko,
  }),
  eh = A({
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
    downloadMs: E().optional(),
  });
M(`type`, [
  Cm,
  wm,
  Tm,
  Em,
  Om,
  km,
  Am,
  jm,
  Mm,
  Nm,
  Pm,
  Fm,
  fm,
  Im,
  Lm,
  Rm,
  zm,
  Bm,
  Vm,
  Hm,
  Um,
  Wm,
  Gm,
  Km,
  qm,
  Jm,
  $m,
  A({ type: F(`network-telemetry-batch`), observations: k(eh).max(500) }),
  Ym,
  Xm,
  Zm,
  Qm,
]);
var th = P([`running`, `completed`, `error`]),
  nh = M(`kind`, [
    A({
      kind: F(`image`),
      filename: w(),
      mimeType: w(),
      sizeBytes: E().int().nonnegative().optional(),
      dataBase64: w().optional(),
      localPath: w().optional(),
    }),
    A({
      kind: F(`file`),
      filename: w(),
      mimeType: w(),
      sizeBytes: E().int().nonnegative(),
      dataBase64: w().optional(),
      textContent: w().optional(),
      localPath: w().optional(),
    }),
  ]),
  rh = A({
    toolName: w().optional(),
    title: w().optional(),
    kind: w().optional(),
    status: P([`completed`, `failed`, `denied`, `stopped`]).optional(),
    input: O(),
    output: O().optional(),
    error: w().optional(),
    raw: O().optional(),
    snapshotRefs: k(
      A({
        field: P([`input`, `output`, `raw`]),
        refId: w(),
        hash: w(),
        fullBytes: E().int().nonnegative(),
        previewBytes: E().int().nonnegative(),
      }),
    ).optional(),
  }),
  ih = M(`type`, [
    A({ type: F(`content`), content: w() }),
    A({ type: F(`thought`), content: w() }),
    A({ type: F(`tool-call`), toolIndex: E().int().nonnegative() }),
  ]),
  ah = A({
    id: w().optional(),
    role: P([`user`, `assistant`]),
    content: w(),
    timestamp: E().int().nonnegative(),
    model: w().optional(),
    characterCount: E().int().nonnegative().optional(),
    durationMs: E().int().nonnegative().optional(),
    interrupted: D().optional(),
    feedback: P([`like`, `dislike`]).optional(),
    attachments: k(nh).optional(),
    tools: k(rh).optional(),
    thought: w().optional(),
    parts: k(ih).optional(),
    checkpointState: P([`partial`]).optional(),
    checkpointReason: P([`tool_completed`, `part_boundary`, `periodic`]).optional(),
    checkpointUpdatedAt: E().int().nonnegative().optional(),
    turnIndex: E().int().nonnegative().optional(),
    bodyRefs: k(
      A({
        field: P([`content`, `thought`]),
        refId: w(),
        hash: w(),
        fullBytes: E().int().nonnegative(),
        previewBytes: E().int().nonnegative(),
      }),
    ).optional(),
    toolSlice: A({
      persistedMessageIndex: E().int().nonnegative(),
      totalTools: E().int().nonnegative(),
      startToolIndex: E().int().nonnegative(),
      endToolIndexExclusive: E().int().nonnegative(),
    }).optional(),
  }),
  oh = P([`active`, `paused`, `budget_limited`, `complete`]),
  sh = P([
    `set`,
    `status_updated`,
    `cleared`,
    `usage_accounted`,
    `run_started`,
    `run_finished`,
    `summary_updated`,
  ]),
  ch = P([`command`, `tool`, `runtime`]),
  lh = A({
    sessionID: Z,
    targetID: Z,
    objective: Z,
    summaryTitle: w().min(1).nullable().default(null),
    status: oh,
    tokenBudget: E().int().positive().nullable(),
    tokensUsed: E().int().nonnegative(),
    timeUsedSeconds: E().int().nonnegative(),
    activeInputId: Z.nullable().optional(),
    activeRunStartedAtMs: E().int().nonnegative().nullable().optional(),
    activeRunLastSeenAtMs: E().int().nonnegative().nullable().optional(),
    time: A({ created: E().int().nonnegative(), updated: E().int().nonnegative() }),
  });
A({ action: sh, source: ch, target: lh.nullable(), previousTarget: lh.nullable().optional() });
var uh = A({
    taskId: Z,
    traceId: Z,
    title: w(),
    titleOverridden: D().optional(),
    workspacePath: Z,
    workspaceIdentity: Z.optional(),
    workspacePurpose: P([`project`, `conversation`]).optional(),
    createdAt: E().int().nonnegative(),
    updatedAt: E().int().nonnegative(),
    mode: hl,
    model: w().optional(),
    thoughtLevel: Z.optional(),
    runtimeEpoch: E().int().nonnegative().optional(),
    provider: I.optional(),
    migrationSource: Dm.optional(),
    forkedFromTaskId: Z.optional(),
    cronAutomationId: Z.optional(),
    offPeakTaskId: Z.optional(),
    unreadAt: E().int().nonnegative().optional(),
    status: th.optional(),
    lastError: A({
      code: w().optional(),
      detail: w().optional(),
      message: w().min(1),
      traceId: Z.optional(),
      taskId: Z.optional(),
    }).optional(),
    repairState: A({
      claudeNativeSnapshotAssistantContentVersion: E().int().nonnegative().optional(),
      codexNativeSnapshotSubagentToolsVersion: E().int().nonnegative().optional(),
    }).optional(),
    changeSummary: A({
      fileCount: E().int().nonnegative(),
      added: E().int().nonnegative(),
      removed: E().int().nonnegative(),
      files: k(
        A({
          path: w(),
          added: E().int().nonnegative(),
          removed: E().int().nonnegative(),
          writeCount: E().int().positive(),
          lastTurnIndex: E().int().nonnegative(),
        }),
      ),
    }).optional(),
    target: lh.nullable().optional(),
  }),
  dh = P([`idle`, `syncing`, `ready`, `stale`, `failed`]);
A({ provider: I, sessionId: Z, lastSyncedTurnIndex: E().int(), state: dh });
var fh = A({ workspaceHash: Z, taskId: Z });
A({ version: F(`1`), tasks: k(fh) });
var ph = A({
    path: w(),
    beforeContent: w().nullable(),
    afterContent: w(),
    writeCount: E().int().positive(),
    contentRefs: k(
      A({
        field: P([`beforeContent`, `afterContent`]),
        refId: w(),
        hash: w(),
        fullBytes: E().int().nonnegative(),
        previewBytes: E().int().nonnegative(),
      }),
    ).optional(),
  }),
  mh = A({
    turnIndex: E().int().nonnegative(),
    snapshots: k(ph),
    fileState: P([`applied`, `reverted`]).optional(),
  }),
  hh = A({
    turnIndex: E().int().nonnegative(),
    baseFileCheckpointId: Z,
    resultFileCheckpointId: Z.optional(),
  });
A({ meta: uh, messages: k(ah), fileChanges: k(mh).optional(), turnCheckpoints: k(hh).optional() });
var gh = `remote:`,
  _h = { ssh: 3, wsl: 1, docker: 1, server: 1 };
function vh(e) {
  return e === `ssh` || e === `wsl` || e === `docker` || e === `server`;
}
function yh(e) {
  return `/${e
    .replace(/\\/g, `/`)
    .replace(/\/+/g, `/`)
    .replace(/^\/+|\/+$/g, ``)}`;
}
function bh(e) {
  let t = e
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, `-`)
    .replace(/^-+|-+$/g, ``);
  if (!t) throw Error(`serverId must contain at least one identity-safe character`);
  return t;
}
function xh(e) {
  return `${gh}server:${bh(e.serverId)}:${yh(e.workspacePath)}`;
}
function Sh(e) {
  if (!e.startsWith(gh)) return null;
  let t = e.slice(7),
    n = t.indexOf(`:`);
  if (n <= 0) return null;
  let r = t.slice(0, n);
  if (!vh(r)) return null;
  let i = n + 1;
  for (let e = 0; e < _h[r]; e++) {
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
  return a.startsWith(`/`) ? { kind: r, workspacePath: a } : null;
}
var Ch = `model-only`,
  wh = `fork`,
  Th = `<system-reminder source="goal-continuation">`,
  Eh = `Continue working toward the active session goal.`,
  Dh = `Current session goal state`,
  Oh = `<task-notification>`,
  kh = `<subagent-notification>`,
  Ah = [`Conversation rewind applied.`, `Workspace rewind applied.`],
  jh = new Set([
    `agent_control_message`,
    `background_task`,
    `goal-continuation`,
    `goal_completion_verification`,
    `goal_state_change`,
    `plugin_reference`,
    `queued_system_notification`,
    `resume_goal_state`,
    `resume_referenced_session_context`,
    `rewind`,
    `selection_side_chat`,
    `subagent`,
    `subagent_message`,
    `target_continuation`,
    `task_notification`,
    `task_status`,
    `todo_reminder`,
  ]);
function Mh(e) {
  let t = e.info,
    n = e.parts ?? [],
    r = t.semantics;
  if (r?.kind === `compact_summary` || t.summary !== void 0) return `providerContextOnly`;
  if (r) {
    if (r.kind === `timeline_event`) return `timelineOnly`;
    if (r.origin === `real_user` && t.synthetic !== !0 && t.visibility !== Ch)
      return `realUserInput`;
    if (
      t.role === `assistant` &&
      r.kind === `assistant_response` &&
      r.uiVisibility === `visible` &&
      r.transcriptVisibility === `visible`
    )
      return `visibleAssistant`;
    if (r.providerVisibility === `visible`) return `providerContextOnly`;
    if (r.kind === `fork_notice`) return `timelineOnly`;
    if (
      r.origin === `agent_runtime` ||
      r.uiVisibility === `hidden` ||
      r.transcriptVisibility === `hidden`
    )
      return `hiddenSynthetic`;
  }
  if (t.visibility === Ch || Ph(n)) return `providerContextOnly`;
  if (Nh(t, n)) return `timelineOnly`;
  let i = Fh(t, n);
  return i === wh
    ? `timelineOnly`
    : (i && jh.has(i)) ||
        Ih(n) ||
        ((t.synthetic === !0 || n.some((e) => e.synthetic === !0)) && Lh(n))
      ? `providerContextOnly`
      : t.synthetic === !0 || n.some((e) => e.synthetic === !0)
        ? `hiddenSynthetic`
        : t.role === `assistant`
          ? `visibleAssistant`
          : `realUserInput`;
}
function Nh(e, t) {
  if (e.semantics?.kind === `timeline_event`) return !0;
  let n = Bh(e.metadata);
  return e.source === wh || Vh(n?.source) === wh
    ? !0
    : t.some((e) => {
        let t = Bh(e.metadata);
        return (
          e.type === `timeline` ||
          zh(t) ||
          (e.type === `compaction` &&
            (typeof t?.timelineStatus == `string` || typeof e.summaryMessageId == `string`))
        );
      });
}
function Ph(e) {
  return e.some((e) => {
    let t = Bh(e.metadata);
    return t?.visibility === Ch || Vh(t?.source) === `goal-continuation`;
  });
}
function Fh(e, t) {
  let n = Bh(e.metadata);
  return (
    e.source ??
    Vh(n?.source) ??
    e.semantics?.source ??
    t.map((e) => Vh(Bh(e.metadata)?.source)).find((e) => !!e)
  );
}
function Ih(e) {
  let t = Rh(e).trimStart();
  return (
    t.startsWith(Th) ||
    (t.startsWith(`<system-reminder>`) && (t.includes(Eh) || t.includes(Dh))) ||
    Ah.some((e) => t.includes(e))
  );
}
function Lh(e) {
  let t = Rh(e).trimStart();
  return t.startsWith(Oh) || t.startsWith(kh);
}
function Rh(e) {
  return e
    .filter((e) => e.type === `text` && e.ignored !== !0)
    .map((e) => e.text ?? ``)
    .join(``);
}
function zh(e) {
  let t = Bh(e)?.forkContext;
  return typeof t == `object` && !!t && !Array.isArray(t) && t.kind === `session_fork`;
}
function Bh(e) {
  return e && typeof e == `object` && !Array.isArray(e) ? e : void 0;
}
function Vh(e) {
  return typeof e == `string` && e.length > 0 ? e : void 0;
}
var Hh = `<system-reminder source="goal-continuation">`,
  Uh = `Continue working toward the active session goal.`,
  Wh = `Current session goal state`,
  Gh = `subagent_message`;
function Kh(e) {
  let t = e.trimStart();
  return t.startsWith(Hh) ? !0 : t.startsWith(`<system-reminder>`) && t.includes(Uh);
}
function qh(e) {
  return (
    e.info.role === `user` &&
    (e.info.source === `goal-continuation` ||
      String(e.info.metadata?.source ?? ``) === `goal-continuation` ||
      Kh(ac(e.parts)))
  );
}
function Jh(e) {
  let t = e.trimStart();
  return t.startsWith(`<system-reminder>`) && t.includes(Wh);
}
function Yh(e) {
  return e.info.role === `user` && (qh(e) || Jh(ac(e.parts)));
}
function Xh(e) {
  if (
    e.info.role === `user` &&
    (String(e.info.source ?? ``) === Gh ||
      String(e.info.metadata?.source ?? ``) === Gh ||
      e.parts.some((e) => e.type === `text` && String(e.metadata?.source ?? ``) === Gh))
  )
    return !0;
  let t = Mh(e);
  return t === `providerContextOnly` || t === `hiddenSynthetic`;
}
function Zh(e) {
  return (
    e.info.role === `user` &&
    e.parts.some((e) =>
      e.type === `compaction` ? typeof e.metadata?.timelineStatus != `string` : !1,
    )
  );
}
function Qh(e, t = {}) {
  let n = [];
  for (let t of e) Xh(t) || Zh(t) || n.push(t);
  return n;
}
function $h(e) {
  let t = e.title?.trim() ?? ``;
  if (t && !Kh(t) && !Jh(t)) return t;
  let n = ac(
    e.messages.find((e) => e.info.role === `user` && Mh(e) === `realUserInput` && !Yh(e))?.parts ??
      [],
  ).trim();
  if (n) return n.slice(0, 80);
  let r = e.target?.objective.trim() ?? ``;
  return r ? r.slice(0, 80) : (e.fallback ?? `New session`);
}
function eg(e) {
  if (e === `running` || e === `waiting` || e === `paused`) return `running`;
  if (e === `error`) return `error`;
  if (e === `completed`) return `completed`;
}
function tg(e) {
  return e.runtime.activeTurnId ||
    e.runtime.activeTurnKind ||
    (e.projection.pendingPermissions ?? []).length > 0
    ? !0
    : (e.projection.activeToolCalls ?? []).some(
        (e) => e.status === `pending` || e.status === `running`,
      );
}
function ng(e) {
  return tg(e);
}
function rg(e) {
  return e?.trim().toLowerCase().replace(/_/g, `-`) === `tool-calls`;
}
function ig(e) {
  let t = Qh(e.messages, { target: e.projection.target }).at(-1);
  return t?.info.role !== `assistant` || rg(t.info.finish)
    ? !1
    : typeof t.info.time.completed == `number`;
}
function ag(e) {
  if (e.projection.lastError) return `error`;
  let t = eg(e.session.status);
  return t === `error` || t === `completed`
    ? t
    : ig(e) && !tg(e)
      ? `completed`
      : ng(e)
        ? (t ?? `running`)
        : t;
}
var og = A({
  path: w().trim().min(1),
  label: w().trim().min(1).optional(),
  workspaceIdentity: w().trim().min(1).optional(),
});
(A({
  serverId: w().trim().min(1),
  name: w().trim().min(1).optional(),
  version: w(),
  protocolVersion: F(1),
  authRequired: D(),
  workspaces: k(og),
  capabilities: A({ desktopContinuous: F(!0), websocketRpc: F(!0) }),
}),
  A({ capability: w().trim().min(1), expiresAt: E().int().positive() }).strict());
var sg = `login-trigger`,
  cg = `login-menu-item`,
  lg = `login-use-api-key-button`,
  ug = `login-api-key-provider-trigger`,
  dg = `login-api-key-provider-item`,
  fg = `login-api-key-input`,
  pg = `login-api-key-continue-button`,
  mg = `login-api-key-cancel-button`,
  hg = `login-api-key-skip-button`,
  gg = `login-api-key-error`,
  _g = `oauth-login-button`,
  vg = `oauth-cancel`,
  yg = `oauth-error`,
  bg = `app-header`,
  xg = `logout-button`,
  Sg = `terminal-toggle`,
  Cg = `terminal-close-button`,
  wg = `git-pane`,
  Tg = `browser-address-input`,
  Eg = `browser-back-button`,
  Dg = `browser-forward-button`,
  Og = `browser-refresh-button`,
  kg = `browser-responsive-button`,
  Ag = `browser-responsive-viewport`,
  jg = `browser-responsive-toolbar`,
  Mg = `browser-responsive-width-input`,
  Ng = `browser-responsive-height-input`,
  Pg = `browser-responsive-zoom-select`,
  Fg = `browser-responsive-zoom-option`,
  Ig = `browser-responsive-scaled-frame`,
  Lg = `browser-responsive-resize-left`,
  Rg = `browser-responsive-resize-width`,
  zg = `browser-responsive-resize-top`,
  Bg = `browser-responsive-resize-height`,
  Vg = `browser-responsive-resize-corner-top-left`,
  Hg = `browser-responsive-resize-corner-top-right`,
  Ug = `browser-responsive-resize-corner-bottom-left`,
  Wg = `browser-responsive-resize-corner`,
  Gg = `browser-element-picker-button`,
  Kg = `browser-more-button`,
  qg = `browser-open-external-item`,
  Jg = `browser-devtools-button`,
  Yg = `browser-webview`,
  Xg = `preview-pane`,
  Zg = `tool-summary-trigger`,
  Qg = `terminal`,
  $g = `ssh-connect-trigger`,
  e_ = `ssh-dialog`,
  t_ = `remote-kind-ssh`,
  n_ = `remote-kind-server`,
  r_ = `remote-kind-wsl`,
  i_ = `remote-kind-docker`,
  a_ = `ssh-host-input`,
  o_ = `ssh-port-input`,
  s_ = `ssh-username-input`,
  c_ = `ssh-config-alias-select`,
  l_ = `ssh-password-input`,
  u_ = `ssh-private-key-input`,
  d_ = `ssh-auth-password`,
  f_ = `ssh-auth-private-key`,
  p_ = `wsl-distro-select`,
  m_ = `wsl-user-input`,
  h_ = `docker-container-select`,
  g_ = `docker-container-input`,
  __ = `server-url-input`,
  v_ = `server-name-input`,
  y_ = `server-token-input`,
  b_ = `server-workspace-path-input`,
  x_ = `sidebar`,
  S_ = `workspace-list`,
  C_ = `workspace-item`,
  w_ = `workspace-close`,
  T_ = `conversation-section`,
  E_ = `project-section`,
  D_ = `conversation-new-task`,
  O_ = `project-add`,
  k_ = `composer-workspace-trigger`,
  A_ = `composer-remote-connection`,
  j_ = `composer-project-detach`,
  M_ = `composer-work-outside-project`,
  N_ = `chat-error-banner`,
  P_ = `chat-empty`,
  F_ = `chat-attachment-button`,
  I_ = `chat-attachment-menu-item`,
  L_ = `chat-send-button`,
  R_ = `chat-loading`,
  z_ = `chat-summary-panel`,
  B_ = `chat-assistant-history-trigger`,
  V_ = `chat-assistant-history-content`,
  H_ = `chat-background-result-title`,
  U_ = `chat-tool-call-block`,
  W_ = `prompt-suggestion-panel`,
  G_ = `prompt-suggestion-section`,
  K_ = `prompt-suggestion-option`,
  q_ = `prompt-suggestion-status`,
  J_ = `task-list`,
  Y_ = `task-new-button`,
  X_ = `task-item`,
  Z_ = `task-empty`,
  Q_ = `task-archive`,
  $_ = `task-settings-button`,
  ev = `settings-page`,
  tv = `settings-back-button`,
  nv = `settings-section-nav`,
  rv = `settings-native-search-switch`,
  iv = `settings-memory-switch`,
  av = `settings-memory-refresh`,
  ov = `settings-memory-back-projects`,
  sv = `settings-memory-back-memories`,
  cv = `settings-memory-workspace`,
  lv = `settings-memory-file`,
  uv = `settings-memory-preview`,
  dv = `settings-ask-user-question-auto-resolution-switch`,
  fv = `settings-locale-select-trigger`,
  pv = `settings-locale-select-item`,
  mv = `mcp-server-row`,
  hv = `plugin-mcp-server-row`,
  gv = `mcp-open-authorization-button`,
  _v = `subagent-row`,
  vv = `subagent-built-in-model-trigger`,
  yv = `settings-usage-tab`,
  bv = `sidebar-coding-plan-usage-button`,
  xv = `model-provider-nav-item`,
  Sv = `model-provider-connection-mode-trigger`,
  Cv = `model-provider-connection-mode-item`,
  wv = `model-provider-api-key-input`,
  Tv = `model-provider-model-input`,
  Ev = `model-provider-model-delete-button`,
  Dv = `model-provider-add-model-button`,
  Ov = `chat-model-select-trigger`,
  kv = `chat-model-select-group`,
  Av = `chat-model-select-item`,
  jv = `chat-thought-level-select-trigger`,
  Mv = `chat-thought-level-select-item`,
  Nv = `chat-mode-select-trigger`,
  Pv = `chat-mode-select-item`,
  Fv = `chat-context-usage-trigger`,
  Iv = `chat-reasoning-trigger`,
  Lv = `chat-reasoning-content`,
  Rv = `workspace-header`,
  zv = `workspace-title`,
  Bv = `workspace-path`,
  Vv = `workspace-more-button`,
  Hv = `workspace-file-tree-button`,
  Uv = `workspace-file-tree-panel`,
  Wv = `workspace-file-tree-refresh-button`,
  Gv = `workspace-file-tree-row`,
  Kv = `ssh-error`,
  qv = `ssh-success`,
  Jv = `v4-session-pane`,
  Yv = `v4-timeline`,
  Xv = `v4-row`,
  Zv = `v4-composer`,
  Qv = `v4-composer-input`,
  $v = `v4-composer-background-work-trigger`,
  ey = `v4-composer-send`,
  ty = `v4-composer-clear-queue-send`,
  ny = `v4-composer-keep-queue-send`,
  ry = `v4-paused-queue-send-dialog`,
  iy = `v4-attachment`,
  ay = `v4-attachment-upload-progress`,
  oy = `v4-attachment-upload-retry`,
  sy = `v4-stop`,
  cy = `v4-fork`,
  ly = `v4-feedback-like`,
  uy = `v4-feedback-dislike`,
  dy = `v4-edit`,
  fy = `v4-edit-input`,
  py = `v4-edit-submit`,
  my = `v4-edit-cancel`,
  hy = `v4-edit-attachment-remove`,
  gy = `v4-edit-rewind-workspace`,
  _y = `v4-edit-workspace-conflict-dialog`,
  vy = `v4-edit-workspace-conflict-conversation-only`,
  yy = `v4-queue`,
  by = `v4-queue-paused-banner`,
  xy = `v4-queue-resume`,
  Sy = `v4-queue-item`,
  Cy = `v4-queue-item-delete`,
  wy = `v4-queue-item-edit`,
  Ty = `v4-queue-item-send-now`,
  Ey = `v4-session-title`,
  Dy = `v4-background-work-item`,
  Oy = `v4-background-work-cancel`,
  ky = `v4-model-config`,
  Ay = `v4-retry-subscribe`,
  jy = `v4-user-input-dialog`,
  My = `v4-user-input-option`,
  Ny = `v4-user-input-text`,
  Py = `v4-timeline-bottom`,
  Fy = `v4-pane-shell`,
  Iy = `v4-split-close`,
  Ly = `v4-split-divider`,
  Ry = `v4-pane-workspace-badge`,
  zy = `v4-task-open-in-split`,
  By = `v4-turn-navigator`,
  Vy = `v4-turn-navigator-item`,
  Hy = `v4-turn-navigator-tooltip`,
  Uy = `v4-subagent-open-side-pane`,
  Wy = `v4-row-attachments`,
  Gy = `automations-open`,
  Ky = `automations-list`,
  qy = `automation-create-menu`,
  Jy = `automation-create-manually`,
  Yy = `automation-card`,
  Xy = `offpeak-create-button`,
  Zy = `offpeak-card`,
  Qy = `offpeak-card-menu`,
  $y = `offpeak-edit-view`,
  eb = `offpeak-edit-submit`,
  tb = `offpeak-form-title`,
  nb = `offpeak-form-instructions`,
  rb = `offpeak-action-pause`,
  ib = `offpeak-action-continue`,
  ab = `offpeak-action-delete`,
  ob = `offpeak-tab`,
  sb = `automation-card-menu`,
  cb = `automation-action-toggle`,
  lb = `automation-action-delete`,
  ub = `automation-form-title`,
  db = `automation-form-prompt`,
  fb = `automation-form-submit`,
  pb = `automation-run-now`,
  mb = `automation-edit-back`,
  hb = `automation-frequency-select`,
  gb = `automation-frequency-option`,
  _b = `automation-custom-unit-select`,
  vb = `automation-custom-unit-option`,
  yb = `automation-custom-interval-select`,
  bb = `automation-custom-interval-increment`,
  xb = `automation-custom-interval-decrement`,
  Sb = `automation-custom-repeat-edit`,
  Cb = `automation-custom-confirm`,
  wb = `automation-year-monthday`,
  Tb = `automation-year-month-option`,
  Eb = `automation-year-day-option`,
  Db = `automation-schedule-preview`,
  Ob = `automation-schedule-add`,
  kb = `automation-schedule-delete`,
  Ab = `cron-create-card`,
  jb = `cron-create-open`,
  Mb = `confirm-dialog-confirm`;
function Nb(e, t) {
  return `${e}-${t}`;
}
var Pb = {
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
    OffPeakTask: `off-peak-task`,
  },
  Fb = { WheelBoundary: `zcode:embedded-browser-wheel-boundary` },
  Ib = {
    ServicePort: `zcode:service-port`,
    RemoteServicePort: `zcode:remote-service-port`,
    TaskNotificationSound: `zcode:task-notification-sound`,
  },
  Lb = `bigmodel`,
  Rb = `ZCODE_CREDENTIAL_DECRYPT_FAILED`;
function zb(e) {
  let t = Bb(e);
  return t ? t === Rb : !!Vb(e).startsWith(`凭据解密失败：`);
}
function Bb(e) {
  return typeof e == `object` && e && `code` in e ? String(e.code ?? ``) : ``;
}
function Vb(e) {
  return e instanceof Error
    ? e.message
    : typeof e == `object` && e && `message` in e
      ? String(e.message ?? ``)
      : ``;
}
var Hb = `zcode-agent`,
  Ub = `team-plan:${W.bigmodelCodingPlan}:`;
function Wb(e) {
  let t = e.productId.trim(),
    n = e.organizationId?.trim() ?? ``,
    r = e.projectId?.trim() ?? ``,
    i = [t];
  return (n && r ? i.push(n, r) : r && i.push(r), `${Ub}${i.map(qb).join(`:`)}`);
}
function Gb(e) {
  let t = e?.trim() ?? ``;
  if (!t.startsWith(Ub)) return null;
  let n = t.slice(Ub.length).split(`:`).map(Jb),
    r = n[0]?.trim() ?? ``;
  if (!r) return null;
  let i = n[1]?.trim() ?? ``,
    a = n[2]?.trim() ?? ``;
  return i && a
    ? { productId: r, organizationId: i, projectId: a, legacyProjectOnly: !1 }
    : { productId: r, organizationId: null, projectId: i || null, legacyProjectOnly: !!i };
}
function Kb(e, t) {
  if (e === t || e.startsWith(`${t}:`) || t.startsWith(`${e}:`)) return !0;
  let n = Gb(e),
    r = Gb(t);
  return !n || !r
    ? !1
    : r.projectId === `0` && n.productId === r.productId
      ? !0
      : !n.projectId || !r.projectId || n.projectId !== r.projectId
        ? !1
        : !n.organizationId || !r.organizationId || n.organizationId === r.organizationId;
}
function qb(e) {
  return encodeURIComponent(e.trim());
}
function Jb(e) {
  try {
    return decodeURIComponent(e.trim());
  } catch {
    return e.trim();
  }
}
function Yb(e) {
  let t = Xb(e.now, `unknown`, ``);
  if (!e.providerFamilyDomain) return t;
  let n = Zb({
    snapshot: e.codingPlanEntitlement,
    now: e.now,
    entitlementCacheTtlMs: e.entitlementCacheTtlMs,
  });
  if (n.kind === `active`) return Xb(n.generatedAt, `coding_plan`, n.planProductId);
  if (n.kind !== `none`) return t;
  let r = Zb({
    snapshot: e.startPlanEntitlement,
    now: e.now,
    entitlementCacheTtlMs: e.entitlementCacheTtlMs,
  });
  return r.kind === `active`
    ? Xb(r.generatedAt, `start_plan`, r.planProductId)
    : r.kind === `none`
      ? Xb(e.now, `no_plan`, ``)
      : t;
}
function Xb(e, t, n) {
  return { generatedAt: e, planStatus: t, planProductId: n };
}
function Zb(e) {
  let t = e.snapshot;
  return !t ||
    e.now - t.generatedAt > e.entitlementCacheTtlMs ||
    !t.authenticated ||
    t.unavailableReason === `unavailable` ||
    t.unavailableReason === `not_authenticated` ||
    t.unavailableReason === `not_configured`
    ? { kind: `unknown` }
    : t.unavailableReason === `no_plan`
      ? { kind: `none` }
      : t.quota || t.subscription || t.remaining
        ? {
            kind: `active`,
            generatedAt: t.generatedAt,
            planProductId: t.subscription?.details[0]?.productId ?? ``,
          }
        : { kind: `unknown` };
}
var Qb = `zcode-browser-restore://pending`;
function $b(e) {
  switch (e.kind) {
    case `ssh`:
      return {
        kind: `ssh`,
        host: e.host,
        port: e.port,
        username: e.username,
        ...(e.sshConfigAlias?.trim() ? { sshConfigAlias: e.sshConfigAlias.trim() } : {}),
      };
    case `wsl`: {
      let t = e.user?.trim();
      return { kind: `wsl`, distro: e.distro, ...(t ? { user: t } : {}) };
    }
    case `docker`:
      return { kind: `docker`, container: e.container };
    case `server`:
      return;
  }
}
var ex = {
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
  ClearAllData: `clearAllData`,
};
function tx(e) {
  let t = typeof Intl < `u` ? Intl.DateTimeFormat().resolvedOptions() : void 0,
    n = e?.timeZone ?? t?.timeZone ?? `UTC`,
    r = e?.intlLocale ?? t?.locale ?? `en-US`,
    i = globalThis.screen,
    a = e?.screen ?? i ?? { width: 0, height: 0 };
  return { clientTimezone: n, clientLanguage: r, screenResolution: `${a.width}x${a.height}` };
}
function nx(e, t, n) {
  return { elementName: e, eventRegion: `web_remote_control`, eventType: t, eventExtraDetail: n };
}
function rx(e) {
  return nx(`web_remote_control_entry_view`, `view`, {
    workspace_kind: e.workspaceKind,
    remote_kind: e.remoteKind ?? ``,
  });
}
var ix = `zcodeLaunchMarks`;
function ax(e) {
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
    i = {};
  for (let e of r) {
    let t = n[e];
    if (typeof t != `number` || !Number.isFinite(t)) return null;
    i[e] = t;
  }
  return i;
}
function ox(e) {
  return e.toString(16).padStart(2, `0`);
}
function sx(e) {
  let t = new Uint8Array(e);
  return (
    (t[6] = (t[6] & 15) | 64),
    (t[8] = (t[8] & 63) | 128),
    [t.slice(0, 4), t.slice(4, 6), t.slice(6, 8), t.slice(8, 10), t.slice(10, 16)]
      .map((e) => Array.from(e, ox).join(``))
      .join(`-`)
  );
}
function cx() {
  let e = globalThis.crypto;
  if (e?.randomUUID) return e.randomUUID();
  if (e?.getRandomValues) {
    let t = new Uint8Array(16);
    return (e.getRandomValues(t), sx(t));
  }
  let t = new Uint8Array(16);
  for (let e = 0; e < t.length; e += 1) t[e] = Math.floor(Math.random() * 256);
  return sx(t);
}
function lx(e) {
  return cx();
}
var ux = `zcode-default-group-cron`,
  dx = `zcode-default-group-off-peak`;
function fx(e) {
  return !!(e.cronAutomationId || e.automationId);
}
function px(e) {
  return !!e.offPeakTaskId;
}
var mx = `AUTOMATION_CREATE_LIMIT_REACHED`;
function hx(e) {
  return (typeof e == `string` ? e : e instanceof Error ? e.message : ``).includes(mx);
}
var gx = [`completed`, `failed`, `cancelled`];
function _x(e) {
  return gx.includes(e);
}
var vx = `offpeak-idle-plan`,
  yx = `model`,
  bx = `model`,
  xx = `mode`,
  Sx = `mode`,
  Cx = `thought_level`,
  wx = `thought_level`,
  Tx = [
    { id: `build`, name: `Ask before changes`, description: `Ask before each file changes.` },
    {
      id: `edit`,
      name: `Edit automatically`,
      description: `Edit selected files or relevant workspace files automatically.`,
    },
    {
      id: `plan`,
      name: `Plan mode`,
      description: `Inspect the code and present a plan before editing.`,
    },
    {
      id: `yolo`,
      name: `Full access`,
      description: `Edit and run commands with fewer confirmations.`,
    },
  ],
  Ex = new Set(Tx.map((e) => e.id));
function Dx(e) {
  let t = `${e.providerId}/${e.modelId}`;
  return e.variant ? `${t}\$${e.variant}` : t;
}
function Ox(e) {
  return Ex.has(e) ? e : `build`;
}
function kx() {
  return Tx.map((e) => ({ value: e.id, name: e.name, description: e.description }));
}
function Ax() {
  return Tx.map((e) => ({ ...e }));
}
function jx(e) {
  let t = [
    {
      id: yx,
      name: `Model`,
      category: bx,
      type: `select`,
      currentValue: Dx(e.model.current),
      options: e.model.available.map((e) => {
        let t = e.reasoning
            ? e.reasoning.enabled
              ? e.reasoning.levels.map((e) => e.value)
              : []
            : void 0,
          n =
            e.reasoning?.defaultLevel && t?.includes(e.reasoning.defaultLevel)
              ? e.reasoning.defaultLevel
              : void 0;
        return {
          value: Dx(e.ref),
          name: e.label,
          description: e.description,
          modelProviderId: e.ref.providerId,
          modelProviderName: e.providerLabel ?? e.ref.providerId,
          ...(t ? { modelThoughtLevels: t } : {}),
          ...(n ? { modelDefaultThoughtLevel: n } : {}),
        };
      }),
    },
    {
      id: xx,
      name: `Mode`,
      category: Sx,
      type: `select`,
      currentValue: Ox(e.mode.current),
      options: kx(),
    },
  ];
  if (e.thoughtLevel.enabled) {
    let n = new Set(e.thoughtLevel.available.map((e) => e.value)),
      r =
        e.thoughtLevel.defaultLevel && n.has(e.thoughtLevel.defaultLevel)
          ? e.thoughtLevel.defaultLevel
          : void 0;
    t.push({
      id: Cx,
      name: `Thought Level`,
      category: wx,
      type: `select`,
      currentValue: e.thoughtLevel.current ?? r ?? e.thoughtLevel.available[0]?.value ?? ``,
      options: e.thoughtLevel.available.map((e) => ({
        value: e.value,
        name: e.label,
        description: e.description,
      })),
    });
  }
  return t;
}
function Mx(e) {
  return (
    e
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, `-`)
      .replace(/^-+|-+$/g, ``) || `provider`
  );
}
function Nx(e) {
  let t = 2166136261;
  for (let n of e) ((t ^= n.codePointAt(0) ?? 0), (t = Math.imul(t, 16777619)));
  return (t >>> 0).toString(16).padStart(8, `0`);
}
function Px(e) {
  let t = e.trim();
  if (!t) throw Error(`providerId 不能为空`);
  return `${Mx(t)}-${Nx(t)}`;
}
function Fx(e, t) {
  let n = t.trim();
  if (!n) throw Error(`modelName 不能为空`);
  return `${Px(e)}/${n}`;
}
function Ix(e = new Date()) {
  return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, `0`)}-${String(e.getDate()).padStart(2, `0`)} ${String(e.getHours()).padStart(2, `0`)}:${String(e.getMinutes()).padStart(2, `0`)}:${String(e.getSeconds()).padStart(2, `0`)}.${String(e.getMilliseconds()).padStart(3, `0`)}`;
}
function Lx(e, t) {
  return `[${Ix()}]${t == null ? `` : ` [pid:${t}]`} [${e}]`;
}
var Rx = `ZCODE_AGENT_PROVIDER_NOT_READY`,
  zx = `provider_not_ready`;
function Bx(e) {
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
function Vx(e) {
  for (let t of e.providers) {
    if (!t.baseURL?.trim() || !Bx(t)) continue;
    let e = t.models.find((e) => !e.disabledReason?.trim());
    if (e) return { ready: !0, providerId: t.providerId, modelId: e.modelId };
  }
  return { ready: !1, reason: zx };
}
var Hx = [
    {
      id: `zai`,
      label: `Z.ai`,
      oauthProviderId: `zai`,
      apiKeyProviderId: W.zai,
      startPlanProviderId: W.zaiStartPlan,
      codingPlanProviderId: W.zaiCodingPlan,
    },
    {
      id: `bigmodel`,
      label: `BigModel`,
      oauthProviderId: Lb,
      apiKeyProviderId: W.bigmodel,
      startPlanProviderId: W.bigmodelStartPlan,
      codingPlanProviderId: W.bigmodelCodingPlan,
    },
  ],
  Ux = new Map(Hx.map((e) => [e.id, e])),
  Wx = new Map(
    Hx.flatMap((e) =>
      [e.apiKeyProviderId, e.startPlanProviderId, e.codingPlanProviderId].map((t) => [t, e.id]),
    ),
  );
function Gx(e, t) {
  return t?.[e] ?? `oauth`;
}
function Kx(e) {
  let t = Yx(e.providerId);
  return t
    ? Gx(t.id, e.familyModes) === `apiKey`
      ? e.providerId === t.apiKeyProviderId
      : e.providerId !== t.apiKeyProviderId
    : !0;
}
function qx(e) {
  return Ux.get(e);
}
function Jx(e) {
  return Wx.get(e) ?? null;
}
function Yx(e) {
  let t = Jx(e);
  return t ? qx(t) : null;
}
function Xx(e) {
  return e === `zai` || e === `bigmodel` ? e : null;
}
function Zx(e) {
  return e === `zai` ? `zai` : e === `bigmodel` ? `bigmodel` : null;
}
function Qx(e) {
  let t = Xx(e.providerFamilyDomain);
  return t ? e.familyId === t : !0;
}
function $x(e) {
  let t = Jx(e.providerId);
  return t ? Qx({ familyId: t, providerFamilyDomain: e.providerFamilyDomain }) : !0;
}
function eS(e) {
  return $x({ providerId: e.providerId, providerFamilyDomain: Zx(e.activeOAuthProvider) });
}
var tS = `custom:`;
function nS(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}
function rS(e, t) {
  let n = encodeURIComponent(e);
  return t ? `${tS}${n}:${encodeURIComponent(t)}` : `${tS}${n}`;
}
function iS(e) {
  if (!e.startsWith(`custom:`)) return null;
  let t = e.slice(7),
    n = t.indexOf(`:`);
  if (n < 0) return { providerId: nS(t) };
  let r = t.split(`:`);
  if (r.length >= 3 && r[0] === `builtin`)
    return { providerId: `${r[0]}:${r[1]}`, modelName: nS(r.slice(2).join(`:`)) };
  let i = t.slice(0, n),
    a = t.slice(n + 1);
  return { providerId: nS(i), modelName: nS(a) };
}
var aS = `native:`,
  oS = `custom:`,
  sS = `ghost:`;
function cS(e) {
  return `${aS}${e}`;
}
function lS(e) {
  return `${oS}${e.trim()}`;
}
function uS(e, t) {
  let n = iS(String(t ?? ``));
  return n?.providerId ? lS(n.providerId) : cS(e);
}
function dS(e) {
  let t = ee(e);
  return (
    t.code === `DATA_BASE_DIR_FORBIDDEN_WINDOWS_INSTALL_DIR` ||
    t.message.includes(`DATA_BASE_DIR_FORBIDDEN_WINDOWS_INSTALL_DIR`)
  );
}
var fS = `settings:app-runtime-preferences`,
  pS = A({ askUserQuestionAutoResolutionEnabled: D() }).strict();
function mS(e) {
  return e.source === `user`;
}
function hS(e) {
  return e.source === `plugin`;
}
var gS = [`zcode-plugins-official`];
function _S(e) {
  return gS.includes(e);
}
var vS = 4e5;
function yS(e) {
  if (!e) return [];
  let t = e.split(`
`);
  return (t[t.length - 1] === `` && t.pop(), t);
}
function bS(e, t) {
  let n = yS(e),
    r = yS(t),
    i = 0;
  for (; i < n.length && i < r.length && n[i] === r[i];) i += 1;
  let a = n.length - 1,
    o = r.length - 1;
  for (; a >= i && o >= i && n[a] === r[o];) (--a, --o);
  let s = n.slice(i, a + 1),
    c = r.slice(i, o + 1);
  if (s.length === 0) return { added: c.length, removed: 0 };
  if (c.length === 0) return { added: 0, removed: s.length };
  if (s.length * c.length > vS) return { added: c.length, removed: s.length };
  let l = Array.from({ length: c.length + 1 }, () => 0);
  for (let e = 1; e <= s.length; e += 1) {
    let t = 0;
    for (let n = 1; n <= c.length; n += 1) {
      let r = l[n];
      (s[e - 1] === c[n - 1] ? (l[n] = t + 1) : (l[n] = Math.max(l[n], l[n - 1])), (t = r));
    }
  }
  let u = l[c.length] ?? 0;
  return { added: c.length - u, removed: s.length - u };
}
function xS(e) {
  return e.headers ?? e.http_headers;
}
function SS(e, t) {
  let n = t.type;
  if ((n || (t.command ? (n = `stdio`) : t.url && (n = `http`)), n === `stdio` && t.command)) {
    let n = t.command,
      r = t.args || [];
    if (
      (typeof process < `u` && process.platform === `win32`) ||
      (typeof navigator < `u` && /win/i.test(navigator.platform))
    ) {
      let e = n.toLowerCase(),
        t = r[1];
      (e === `cmd` || e === `cmd.exe`) && r[0] === `/c` && t && ((n = t), (r = r.slice(2)));
    }
    return {
      name: e,
      command: n,
      args: r,
      env: t.env ? Object.entries(t.env).map(([e, t]) => ({ name: e, value: t })) : [],
      ...(CS(t.timeoutMs) ? { timeoutMs: t.timeoutMs } : {}),
      ...(wS(t.isolation) ? { isolation: t.isolation } : {}),
      ...(TS(t.protocolVersion) ? { protocolVersion: t.protocolVersion } : {}),
    };
  } else if (t.url && n) {
    let r = n === `sse` ? `sse` : `http`,
      i = xS(t);
    return {
      name: e,
      type: r,
      url: t.url,
      headers: i ? Object.entries(i).map(([e, t]) => ({ name: e, value: t })) : [],
      ...(ES(t.oauth) ? { oauth: t.oauth } : {}),
      ...(CS(t.timeoutMs) ? { timeoutMs: t.timeoutMs } : {}),
      ...(wS(t.isolation) ? { isolation: t.isolation } : {}),
      ...(TS(t.protocolVersion) ? { protocolVersion: t.protocolVersion } : {}),
    };
  }
  return null;
}
function CS(e) {
  return typeof e == `number` && Number.isInteger(e) && e > 0;
}
function wS(e) {
  return e === `session` || e === `workspace`;
}
function TS(e) {
  return e === `legacy` || e === `auto` || e === `2026-07-28`;
}
function ES(e) {
  return DS(e)
    ? e.type === `client_credentials` &&
      typeof e.clientId == `string` &&
      e.clientId.trim().length > 0 &&
      typeof e.clientSecret == `string` &&
      e.clientSecret.trim().length > 0
      ? (e.clientName === void 0 || typeof e.clientName == `string`) &&
        (e.scope === void 0 || typeof e.scope == `string`)
      : e.type === `authorization_code`
        ? (e.clientId === void 0 || typeof e.clientId == `string`) &&
          (e.clientSecret === void 0 || typeof e.clientSecret == `string`) &&
          (e.clientName === void 0 || typeof e.clientName == `string`) &&
          (e.redirectPath === void 0 || typeof e.redirectPath == `string`) &&
          (e.scope === void 0 || typeof e.scope == `string`)
        : !1
    : !1;
}
function DS(e) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function OS(e, t) {
  return t === `win32` ? `${e}.exe` : e;
}
var kS = {
  bfs: {
    binaryEnvVar: `ZCODE_BFS_BINARY`,
    bundledResourceDir: `bfs`,
    resolveEntrySegments: (e) => [OS(`bfs`, e)],
  },
  ripgrep: {
    binaryEnvVar: `ZCODE_RG_BINARY`,
    bundledResourceDir: `ripgrep`,
    resolveEntrySegments: (e) => [OS(`rg`, e)],
  },
  ugrep: {
    binaryEnvVar: `ZCODE_UGREP_BINARY`,
    bundledResourceDir: `ugrep`,
    resolveEntrySegments: (e) => [OS(`ugrep`, e)],
  },
};
(({ ...kS.bfs }), { ...kS.ripgrep }, { ...kS.ugrep });
var AS = new Set([`input-streaming`, `input-available`]),
  jS = {
    "input-streaming": `chat.toolCall.status.pending`,
    "input-available": `chat.toolCall.status.running`,
    "output-available": `chat.toolCall.status.completed`,
    "output-error": `chat.toolCall.status.failed`,
    "output-denied": `chat.toolCall.status.denied`,
  };
function MS(e) {
  return AS.has(e);
}
function NS(e, t) {
  return t === `stopped`
    ? `chat.toolCall.status.stopped`
    : (jS[e] ?? `chat.toolCall.status.pending`);
}
var PS =
    `Read.Write.Edit.ApplyPatch.Bash.Glob.Grep.WebFetch.WebSearch.web_search.TodoRead.TodoWrite.GoalRead.ReadSessionContext.AskUserQuestion.SendMessage.RespondToCoordinator.TaskOutput.TaskStop.js.js_reset.js_add_node_module_dir.mcp__node_repl__js.mcp__node_repl__js_reset.mcp__node_repl__js_add_node_module_dir.Agent.Task.Skill`.split(
      `.`,
    ),
  FS = {
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
    Skill: `skill`,
  },
  IS = new Map(PS.map((e) => [e.toLowerCase(), e]));
function LS(e) {
  let t = e?.trim();
  return t ? (IS.get(t.toLowerCase()) ?? null) : null;
}
function RS(e) {
  let t = LS(e);
  return t ? FS[t] : null;
}
function zS(e) {
  return LS(e) === `Write`;
}
var BS = [
  `file_path`,
  `filePath`,
  `path`,
  `target_path`,
  `targetPath`,
  `filename`,
  `file`,
  `content`,
  `new_string`,
  `newString`,
  `new_text`,
  `newText`,
  `old_string`,
  `oldString`,
  `old_text`,
  `oldText`,
  `command`,
  `description`,
  `title`,
  `pattern`,
  `replacement`,
  `plan`,
];
function VS(e, t) {
  if (t !== void 0) return { complete: !0, input: t, rawInput: e };
  let n = HS(e);
  return n.ok
    ? { complete: !0, input: n.value, rawInput: e }
    : { complete: !1, input: US(e) ?? {}, rawInput: e };
}
function HS(e) {
  try {
    return { ok: !0, value: JSON.parse(e) };
  } catch {
    return { ok: !1 };
  }
}
function US(e) {
  let t = {};
  for (let n of BS) {
    let r = WS(e, n);
    r !== void 0 && (t[n] = r);
  }
  return Object.keys(t).length > 0 ? t : null;
}
function WS(e, t) {
  let n = RegExp(`"${JS(t)}"\\s*:\\s*"`).exec(e);
  if (!n) return;
  let r = ``,
    i = !1,
    a = !1;
  for (let t = n.index + n[0].length; t < e.length; t += 1) {
    let n = e[t] ?? ``;
    if (i) {
      ((r += `\\${n}`), (i = !1));
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
  return (i && (r += `\\`), GS(r, a));
}
function GS(e, t) {
  let n = t ? e : KS(e);
  try {
    return JSON.parse(`"${n}"`);
  } catch {
    return qS(n);
  }
}
function KS(e) {
  return e.replace(/\\u[0-9a-fA-F]{0,3}$/, ``).replace(/\\$/, ``);
}
function qS(e) {
  return e
    .replace(
      /\\n/g,
      `
`,
    )
    .replace(/\\r/g, `\r`)
    .replace(/\\t/g, `	`)
    .replace(/\\"/g, `"`)
    .replace(/\\\\/g, `\\`);
}
function JS(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}
var YS = /(?:^|[_\s-])(?:todo[_\s-]*(?:read|write)|update[_\s-]*plan)(?:$|[_\s-])/i,
  XS = [`todos`, `plan`, `steps`, `items`];
function ZS(e) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function QS(e) {
  return typeof e == `string` && e.trim().length > 0 ? e.trim() : void 0;
}
function $S(e) {
  let t = QS(e)?.replace(/-/g, `_`).toLowerCase();
  return t === `pending` || t === `in_progress` || t === `completed` ? t : null;
}
function eC(e, t) {
  if (typeof e == `string`) {
    let n = e.trim();
    return n ? { id: n, title: n, status: t === 0 ? `in_progress` : `pending` } : null;
  }
  if (!ZS(e)) return null;
  let n = QS(e.content) ?? QS(e.step) ?? QS(e.title) ?? QS(e.text) ?? QS(e.activeForm),
    r = $S(e.status);
  return !n || !r ? null : { id: QS(e.id) ?? n, title: n, status: r };
}
function tC(e) {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}
function nC(e) {
  let t = typeof e == `string` ? tC(e) : e;
  if (!ZS(t)) return null;
  for (let e of XS) {
    let n = t[e];
    if (Array.isArray(n)) return n;
  }
  return null;
}
function rC(e) {
  let t = nC(e);
  if (!t || t.length === 0) return null;
  let n = t.map((e, t) => eC(e, t)).filter((e) => e !== null);
  return n.length === t.length ? n : null;
}
function iC(e) {
  let t = [e],
    n = typeof e == `string` ? tC(e) : void 0;
  if ((n !== void 0 && t.push(n), ZS(e)))
    for (let n of [`content`, `output`, `result`]) {
      let r = e[n];
      if ((t.push(r), typeof r == `string`)) {
        let e = tC(r);
        e !== void 0 && t.push(e);
      }
    }
  return t;
}
function aC(e) {
  return typeof e == `string` && YS.test(e.trim());
}
function oC(e) {
  return aC([e.title, e.kind].filter(Boolean).join(` `)) ? rC(e.input) : null;
}
function sC(e) {
  if (!aC([e.title, e.kind].filter(Boolean).join(` `))) return null;
  for (let t of iC(e.output)) {
    let e = rC(t);
    if (e) return e;
  }
  return null;
}
var cC = new Set([`command`, `cmd`, `script`, `shellcommand`]),
  lC = new Set([`args`, `argv`, `arguments`]),
  uC = new Set([
    `path`,
    `paths`,
    `file`,
    `file_path`,
    `filepath`,
    `files`,
    `filename`,
    `filenames`,
    `target`,
    `targets`,
    `location`,
    `locations`,
  ]),
  dC = new Set([`cwd`, `directory`, `workingdirectory`]),
  fC = 6;
function $(e) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function pC(e) {
  return e.trim().replace(/\s+/g, ` `);
}
function mC(e) {
  return e.trim().replace(
    /\r\n/g,
    `
`,
  );
}
function hC(e) {
  return Array.isArray(e)
    ? e
        .map((e) =>
          typeof e == `string`
            ? e.trim()
            : typeof e == `number` || typeof e == `boolean` || typeof e == `bigint`
              ? String(e)
              : ``,
        )
        .filter((e) => e.length > 0)
    : [];
}
function gC(e) {
  return $(e)
    ? `rawInput` in e && e.rawInput !== void 0
      ? e.rawInput
      : `input` in e
        ? e.input
        : e
    : e;
}
function _C(e) {
  for (let [t, n] of Object.entries(e)) {
    if (!cC.has(t.toLowerCase()) || typeof n != `string`) continue;
    let r = mC(n);
    if (r.length !== 0) {
      for (let [t, n] of Object.entries(e)) {
        if (!lC.has(t.toLowerCase())) continue;
        let e = hC(n);
        if (e.length > 0) return `${r} ${e.join(` `)}`;
      }
      return r;
    }
  }
  return null;
}
function vC(e, t = new Set(), n = !1) {
  if (typeof e == `string`) {
    if (!n) return null;
    let t = mC(e);
    return t.length > 0 ? t : null;
  }
  if (Array.isArray(e)) {
    if (t.has(e)) return null;
    t.add(e);
    for (let n of e) {
      let e = vC(n, t);
      if (e) return e;
    }
    return null;
  }
  if (!$(e) || t.has(e)) return null;
  t.add(e);
  let r = _C(e);
  if (r) return r;
  for (let n of [`rawInput`, `input`, `params`, `toolCall`]) {
    if (!(n in e)) continue;
    let r = vC(e[n], t, n === `rawInput` || n === `input` || n === `params`);
    if (r) return r;
  }
  for (let n of Object.values(e)) {
    if (!Array.isArray(n) && !$(n)) continue;
    let e = vC(n, t);
    if (e) return e;
  }
  return null;
}
function yC(e, t) {
  let n = pC(t);
  !n || e.includes(n) || e.push(n);
}
function bC(e, t, n) {
  if (!(t.length >= fC)) {
    if (typeof e == `string`) {
      yC(t, e);
      return;
    }
    if (Array.isArray(e)) {
      if (n.has(e)) return;
      n.add(e);
      for (let r of e) if ((bC(r, t, n), t.length >= fC)) return;
      return;
    }
    if (
      !(!$(e) || n.has(e)) &&
      (n.add(e), !(typeof e.path == `string` && (yC(t, e.path), t.length >= fC)))
    ) {
      for (let r of Object.values(e)) if ((bC(r, t, n), t.length >= fC)) return;
    }
  }
}
function xC(e, t, n = new Set()) {
  if (!(t.length >= fC)) {
    if (Array.isArray(e)) {
      if (n.has(e)) return;
      n.add(e);
      for (let r of e) if ((xC(r, t, n), t.length >= fC)) return;
      return;
    }
    if (!(!$(e) || n.has(e))) {
      n.add(e);
      for (let [r, i] of Object.entries(e)) {
        let e = r.toLowerCase();
        if (!dC.has(e)) {
          if (uC.has(e)) {
            if ((bC(i, t, n), t.length >= fC)) return;
            continue;
          }
          if (!(!Array.isArray(i) && !$(i)) && (xC(i, t, n), t.length >= fC)) return;
        }
      }
    }
  }
}
function SC(e, t, n = new Set()) {
  if (Array.isArray(e)) {
    if (n.has(e)) return;
    n.add(e);
    for (let r of e) SC(r, t, n);
    return;
  }
  if (!(!$(e) || n.has(e))) {
    if ((n.add(e), $(e.changes)))
      for (let [n, r] of Object.entries(e.changes))
        $(r) &&
          ((r.type !== `add` && r.type !== `update`) ||
            t.some((e) => e.path === n && e.type === r.type) ||
            t.push({ path: n, type: r.type }));
    for (let r of Object.values(e)) (!Array.isArray(r) && !$(r)) || SC(r, t, n);
  }
}
function CC(e) {
  let t = e.raw,
    n = [];
  xC(t, n);
  let r = pC(e.title ?? e.description ?? e.kind) || `permission`,
    i = vC(gC(t), new Set(), !0),
    a = [];
  SC(t, a);
  let o = a.length === 1 ? a[0] : null;
  return {
    title: r,
    command: i,
    filePaths: n,
    scope: i ? `command` : n.length > 0 ? `file` : `generic`,
    fileChange: o,
    fileChanges: a,
  };
}
function wC(e) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}
var TC = `coding_plan_security_verification_required`,
  EC = `coding_plan_system_busy`;
function DC() {
  return globalThis.process?.env ?? {};
}
function OC(e = DC()) {
  return e.INTRANET_MACHINE_HOST?.trim() || `studio.zcode-ai.com`;
}
var kC = OC();
`${kC}`;
var AC = {
  targets: [
    {
      kind: `service`,
      url: `http://${kC}:3850/api/intranet/probe`,
      expectedMarker: `zcode-intranet`,
    },
  ],
  attempts: 2,
  requiredSuccessCount: 1,
};
function jC(e) {
  return e.env === `test` || e.isIntranet;
}
function MC(e) {
  return e || {};
}
function NC(e) {
  if (!e) return !1;
  let t = e.trim().toLowerCase();
  return t === `1` || t === `true`;
}
function PC(e) {
  let t = e?.trim().toLowerCase();
  return t === `test` || t === `production` ? t : void 0;
}
function FC(e) {
  let t = e?.trim().toLowerCase();
  return t === `auto` || t === `intranet` || t === `internet` ? t : void 0;
}
function IC(e) {
  let t = MC(e),
    n = PC(t.ZCODE_EFFECTIVE_ENV),
    r = FC(t.ZCODE_NETWORK_ENV);
  return n || r
    ? { effectiveEnv: n, networkEnv: r ?? `auto` }
    : NC(t.ZCODE_SIMULATE_PUBLIC_PROD)
      ? { effectiveEnv: `production`, networkEnv: `internet` }
      : { effectiveEnv: void 0, networkEnv: `auto` };
}
function LC(e) {
  let t = IC(e.env),
    n = t.effectiveEnv ?? e.rawEnv;
  return {
    env: n,
    isIntranet:
      t.networkEnv === `intranet` ? !0 : t.networkEnv === `internet` ? !1 : e.probedIsIntranet,
    shouldProbe: n === `production` && t.networkEnv === `auto`,
  };
}
function RC(e, t) {
  return `repo_snapshot_${e}/${t}`;
}
(RC(`manifest`, `v2`),
  RC(`prompt`, `v2`),
  RC(`delta`, `v2`),
  RC(`encrypted_artifact`, `v2`),
  RC(`encryption_aad`, `v2`),
  RC(`manifest_hash`, `v1`),
  RC(`upload_key`, `v1`),
  RC(`upload_target`, `v1`));
function zC(e) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}
function BC(e, t, n) {
  for (let r = t; r < n; r += 1) if (e[r]?.kind === `local`) return r;
  return null;
}
function VC(e, t) {
  if (e.length === 0) return null;
  let n = Math.min(Math.max(t ?? 0, 0), e.length - 1);
  return BC(e, n, e.length) ?? BC(e, 0, n);
}
var HC = A({
  id: w().uuid(),
  runtimeScope: P([`main`, `subagent`]),
  token: w().min(32),
  sessionId: w().trim().min(1),
  turnId: w().trim().min(1).optional(),
  trace: A({
    traceId: w().trim().min(1),
    spanId: w().trim().min(1).optional(),
    parentSpanId: w().trim().min(1).optional(),
  })
    .strict()
    .optional(),
});
(M(`op`, [
  HC.extend({ op: F(`list`) }).strict(),
  HC.extend({
    op: F(`execute`),
    browserId: w().trim().min(1),
    browserGeneration: E().int().nonnegative(),
    command: Ko,
  }).strict(),
]),
  M(`ok`, [
    A({ id: w().uuid(), ok: F(!0), browsers: k(Yo).optional(), result: as.optional() }).strict(),
    A({ id: w().uuid(), ok: F(!1), error: w().min(1) }).strict(),
  ]));
export {
  mx as $,
  xh as $a,
  my as $i,
  jb as $n,
  fc as $o,
  dv as $r,
  Tg as $t,
  aS as A,
  Py as Aa,
  Q_ as Ai,
  P_ as An,
  tu as Ao,
  Qy as Ar,
  ee as As,
  sb as At,
  Yx as B,
  Wv as Ba,
  iy as Bi,
  L_ as Bn,
  $l as Bo,
  E_ as Br,
  mb as Bt,
  hS as C,
  Ey as Ca,
  l_ as Ci,
  Yg as Cn,
  eu as Co,
  vg as Cr,
  E as Cs,
  Pb as Ct,
  dS as D,
  Uy as Da,
  s_ as Di,
  I_ as Dn,
  bl as Do,
  ab as Dr,
  j as Ds,
  lb as Dt,
  pS as E,
  sy as Ea,
  qv as Ei,
  F_ as En,
  _l as Eo,
  ib as Er,
  w as Es,
  Gy as Et,
  rS as F,
  My as Fa,
  $_ as Fi,
  Ov as Fn,
  du as Fo,
  tb as Fr,
  bb as Ft,
  Vx as G,
  Vv as Ga,
  Zv as Gi,
  j_ as Gn,
  $c as Go,
  i_ as Gr,
  hb as Gt,
  eS as H,
  Rv as Ha,
  oy as Hi,
  Mv as Hn,
  uu as Ho,
  W_ as Hr,
  fb as Ht,
  qx as I,
  Ny as Ia,
  Qg as Ii,
  Pv as In,
  ou as Io,
  ob as Ir,
  yb as It,
  Ax as J,
  p_ as Ja,
  Qv as Ji,
  M_ as Jn,
  Vc as Jo,
  r_ as Jr,
  kb as Jt,
  Lx as K,
  Bv as Ka,
  $v as Ki,
  A_ as Kn,
  zc as Ko,
  n_ as Kr,
  pb as Kt,
  Xx as L,
  w_ as La,
  Cg as Li,
  Nv as Ln,
  _u as Lo,
  hv as Lr,
  Sb as Lt,
  cS as M,
  Vy as Ma,
  X_ as Mi,
  R_ as Mn,
  Ql as Mo,
  eb as Mr,
  a as Ms,
  qy as Mt,
  uS as N,
  Hy as Na,
  J_ as Ni,
  kv as Nn,
  yl as No,
  $y as Nr,
  t as Ns,
  Cb as Nt,
  oS as O,
  zy as Oa,
  vv as Oi,
  H_ as On,
  Tl as Oo,
  rb as Or,
  O as Os,
  cb as Ot,
  iS as P,
  jy as Pa,
  Y_ as Pi,
  Av as Pn,
  vl as Po,
  nb as Pr,
  e as Ps,
  xb as Pt,
  _x as Q,
  $h as Qa,
  hy as Qi,
  Ab as Qn,
  dc as Qo,
  b_ as Qr,
  Tb as Qt,
  Jx as R,
  Hv as Ra,
  Sg as Ri,
  Lv as Rn,
  Cu as Ro,
  Xg as Rr,
  vb as Rt,
  _S as S,
  Jv as Sa,
  a_ as Si,
  Pg as Sn,
  yu as So,
  xv as Sr,
  Ka as Ss,
  Ib as St,
  fS as T,
  Ly as Ta,
  u_ as Ti,
  B_ as Tn,
  Jl as To,
  _g as Tr,
  N as Ts,
  Ky as Tt,
  Kx as U,
  C_ as Ua,
  Oy as Ui,
  jv as Un,
  vu as Uo,
  G_ as Ur,
  ub as Ut,
  Zx as V,
  Gv as Va,
  ay as Vi,
  z_ as Vn,
  lu as Vo,
  K_ as Vr,
  db as Vt,
  Rx as W,
  S_ as Wa,
  Dy as Wi,
  U_ as Wn,
  Tu as Wo,
  q_ as Wr,
  gb as Wt,
  jx as X,
  Nb as Xa,
  ey as Xi,
  D_ as Xn,
  Cc as Xo,
  y_ as Xr,
  Eb as Xt,
  kx as Y,
  m_ as Ya,
  ny as Yi,
  Mb as Yn,
  Lc as Yo,
  v_ as Yr,
  Db as Yt,
  vx as Z,
  ag as Za,
  dy as Zi,
  T_ as Zn,
  uc as Zo,
  __ as Zr,
  wb as Zt,
  NS as _,
  by as _a,
  f_ as _i,
  Ig as _n,
  Yl as _o,
  wv as _r,
  P as _s,
  Yb as _t,
  jC as a,
  uy as aa,
  lv as ai,
  qg as an,
  zf as ao,
  gg as ar,
  nc as as,
  px as at,
  bS as b,
  Xv as ba,
  e_ as bi,
  Mg as bn,
  cu as bo,
  Ev as br,
  M as bs,
  zb as bt,
  wC as c,
  ky as ca,
  iv as ci,
  Ng as cn,
  Lf as co,
  ug as cr,
  tc as cs,
  ax as ct,
  sC as d,
  ry as da,
  ev as di,
  Vg as dn,
  df as do,
  sg as dr,
  Es as ds,
  Qb as dt,
  fy as ea,
  tv as ei,
  Eg as en,
  Sh as eo,
  g_ as er,
  bc as es,
  hx as et,
  aC as f,
  yy as fa,
  nv as fi,
  Hg as fn,
  J as fo,
  lg as fr,
  ms as fs,
  ex as ft,
  LS as g,
  Ty as ga,
  d_ as gi,
  Rg as gn,
  Zl as go,
  Dv as gr,
  Ao as gs,
  Gb as gt,
  zS as h,
  wy as ha,
  bv as hi,
  zg as hn,
  Sl as ho,
  mv as hr,
  Mo as hs,
  Kb as ht,
  AC as i,
  _y as ia,
  ov as ii,
  Kg as in,
  Uf as io,
  pg as ir,
  sc as is,
  fx as it,
  lS as j,
  By as ja,
  Z_ as ji,
  N_ as jn,
  ql as jo,
  Xy as jr,
  s as js,
  Jy as jt,
  sS as k,
  Yv as ka,
  _v as ki,
  Fv as kn,
  Kl as ko,
  Zy as kr,
  te as ks,
  Yy as kt,
  CC as l,
  Fy as la,
  cv as li,
  Wg as ln,
  If as lo,
  hg as lr,
  ws as ls,
  rx as lt,
  RS as m,
  Cy as ma,
  x_ as mi,
  Lg as mn,
  W as mo,
  gv as mr,
  ss as ms,
  Wb as mt,
  zC as n,
  py as na,
  fv as ni,
  Gg as nn,
  Wf as no,
  wg as nr,
  cc as ns,
  dx as nt,
  TC as o,
  ly as oa,
  uv as oi,
  Og as on,
  Rf as oo,
  fg as or,
  Us as os,
  cx as ot,
  VS as p,
  Sy as pa,
  yv as pi,
  Bg as pn,
  Ru as po,
  xg as pr,
  fs as ps,
  $b as pt,
  Fx as q,
  zv as qa,
  ty as qi,
  k_ as qn,
  Bc as qo,
  t_ as qr,
  Ob as qt,
  LC as r,
  vy as ra,
  sv as ri,
  Dg as rn,
  Bf as ro,
  mg as rr,
  Sc as rs,
  lx as rt,
  EC as s,
  cy as sa,
  av as si,
  kg as sn,
  Ff as so,
  dg as sr,
  Fs as ss,
  ix as st,
  VC as t,
  gy as ta,
  pv as ti,
  Jg as tn,
  ip as to,
  h_ as tr,
  xc as ts,
  ux as tt,
  oC as u,
  Ry as ua,
  rv as ui,
  Ug as un,
  yd as uo,
  cg as ur,
  Ds as us,
  tx as ut,
  MS as v,
  xy as va,
  c_ as vi,
  jg as vn,
  xl as vo,
  Cv as vr,
  k as vs,
  Hb as vt,
  mS as w,
  Iy as wa,
  o_ as wi,
  V_ as wn,
  ru as wo,
  yg as wr,
  A as ws,
  bg as wt,
  gS as x,
  Wy as xa,
  Kv as xi,
  Fg as xn,
  fu as xo,
  Tv as xr,
  F as xs,
  Fb as xt,
  SS as y,
  Ay as ya,
  $g as yi,
  Ag as yn,
  El as yo,
  Sv as yr,
  D as ys,
  Lb as yt,
  Gx as z,
  Uv as za,
  Zg as zi,
  Iv as zn,
  wu as zo,
  O_ as zr,
  _b as zt,
};
