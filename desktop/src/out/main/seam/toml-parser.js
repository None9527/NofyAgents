// TOML parser extracted unchanged from the shipped main bundle.
// Shared by native config readers; no additional runtime dependency.
const s = (value, name) => Object.defineProperty(value, "name", { value: name, configurable: true });
function getLineColFromPtr(e, t) {
  let n = e.slice(0, t).split(/\r\n|\n|\r/g);
  return [n.length, n.pop().length + 1];
}
s(getLineColFromPtr, "getLineColFromPtr");
function makeCodeBlock(e, t, n) {
  let o = e.split(/\r\n|\n|\r/g),
    r = "",
    i = (Math.log10(t + 1) | 0) + 1;
  for (let a = t - 1; a <= t + 1; a++) {
    let c = o[a - 1];
    c &&
      ((r += a.toString().padEnd(i, " ")),
      (r += ":  "),
      (r += c),
      (r += `
`),
      a === t &&
        ((r += " ".repeat(i + n + 2)),
        (r += `^
`)));
  }
  return r;
}
s(makeCodeBlock, "makeCodeBlock");
var se = class extends Error {
  static {
    s(this, "TomlError");
  }
  line;
  column;
  codeblock;
  constructor(t, n) {
    let [o, r] = getLineColFromPtr(n.toml, n.ptr),
      i = makeCodeBlock(n.toml, o, r);
    (super(
      `Invalid TOML document: ${t}

${i}`,
      n,
    ),
      (this.line = o),
      (this.column = r),
      (this.codeblock = i));
  }
};
function isEscaped(e, t) {
  let n = 0;
  for (; e[t - ++n] === "\\";);
  return --n && n % 2;
}
s(isEscaped, "isEscaped");
function indexOfNewline(e, t = 0, n = e.length) {
  let o = e.indexOf(
    `
`,
    t,
  );
  return (e[o - 1] === "\r" && o--, o <= n ? o : -1);
}
s(indexOfNewline, "indexOfNewline");
function skipComment(e, t) {
  for (let n = t; n < e.length; n++) {
    let o = e[n];
    if (
      o ===
      `
`
    )
      return n;
    if (
      o === "\r" &&
      e[n + 1] ===
        `
`
    )
      return n + 1;
    if ((o < " " && o !== "	") || o === "\x7F")
      throw new se("control characters are not allowed in comments", { toml: e, ptr: t });
  }
  return e.length;
}
s(skipComment, "skipComment");
function skipVoid(e, t, n, o) {
  let r;
  for (;;) {
    for (
      ;
      (r = e[t]) === " " ||
      r === "	" ||
      (!n &&
        (r ===
          `
` ||
          (r === "\r" &&
            e[t + 1] ===
              `
`)));
    )
      t++;
    if (o || r !== "#") break;
    t = skipComment(e, t);
  }
  return t;
}
s(skipVoid, "skipVoid");
function skipUntil(e, t, n, o, r = !1) {
  if (!o) return ((t = indexOfNewline(e, t)), t < 0 ? e.length : t);
  for (let i = t; i < e.length; i++) {
    let a = e[i];
    if (a === "#") i = indexOfNewline(e, i);
    else {
      if (a === n) return i + 1;
      if (
        a === o ||
        (r &&
          (a ===
            `
` ||
            (a === "\r" &&
              e[i + 1] ===
                `
`)))
      )
        return i;
    }
  }
  throw new se("cannot find end of structure", { toml: e, ptr: t });
}
s(skipUntil, "skipUntil");
function getStringEnd(e, t) {
  let n = e[t],
    o = n === e[t + 1] && e[t + 1] === e[t + 2] ? e.slice(t, t + 3) : n;
  t += o.length - 1;
  do t = e.indexOf(o, ++t);
  while (t > -1 && n !== "'" && isEscaped(e, t));
  return (t > -1 && ((t += o.length), o.length > 1 && (e[t] === n && t++, e[t] === n && t++)), t);
}
s(getStringEnd, "getStringEnd");
var TB = /^(\d{4}-\d{2}-\d{2})?[T ]?(?:(\d{2}):\d{2}(?::\d{2}(?:\.\d+)?)?)?(Z|[-+]\d{2}:\d{2})?$/i,
  ns = class e extends Date {
    static {
      s(this, "TomlDate");
    }
    #t = !1;
    #n = !1;
    #e = null;
    constructor(t) {
      let n = !0,
        o = !0,
        r = "Z";
      if (typeof t == "string") {
        let i = t.match(TB);
        i
          ? (i[1] || ((n = !1), (t = `0000-01-01T${t}`)),
            (o = !!i[2]),
            o && t[10] === " " && (t = t.replace(" ", "T")),
            i[2] && +i[2] > 23
              ? (t = "")
              : ((r = i[3] || null), (t = t.toUpperCase()), !r && o && (t += "Z")))
          : (t = "");
      }
      (super(t), isNaN(this.getTime()) || ((this.#t = n), (this.#n = o), (this.#e = r)));
    }
    isDateTime() {
      return this.#t && this.#n;
    }
    isLocal() {
      return !this.#t || !this.#n || !this.#e;
    }
    isDate() {
      return this.#t && !this.#n;
    }
    isTime() {
      return this.#n && !this.#t;
    }
    isValid() {
      return this.#t || this.#n;
    }
    toISOString() {
      let t = super.toISOString();
      if (this.isDate()) return t.slice(0, 10);
      if (this.isTime()) return t.slice(11, 23);
      if (this.#e === null) return t.slice(0, -1);
      if (this.#e === "Z") return t;
      let n = +this.#e.slice(1, 3) * 60 + +this.#e.slice(4, 6);
      return (
        (n = this.#e[0] === "-" ? n : -n),
        new Date(this.getTime() - n * 6e4).toISOString().slice(0, -1) + this.#e
      );
    }
    static wrapAsOffsetDateTime(t, n = "Z") {
      let o = new e(t);
      return ((o.#e = n), o);
    }
    static wrapAsLocalDateTime(t) {
      let n = new e(t);
      return ((n.#e = null), n);
    }
    static wrapAsLocalDate(t) {
      let n = new e(t);
      return ((n.#n = !1), (n.#e = null), n);
    }
    static wrapAsLocalTime(t) {
      let n = new e(t);
      return ((n.#t = !1), (n.#e = null), n);
    }
  };
var EB = /^((0x[0-9a-fA-F](_?[0-9a-fA-F])*)|(([+-]|0[ob])?\d(_?\d)*))$/,
  AB = /^[+-]?\d(_?\d)*(\.\d(_?\d)*)?([eE][+-]?\d(_?\d)*)?$/,
  xB = /^[+-]?0[0-9_]/,
  MB = /^[0-9a-f]{2,8}$/i,
  u_ = {
    b: "\b",
    t: "	",
    n: `
`,
    f: "\f",
    r: "\r",
    e: "\x1B",
    '"': '"',
    "\\": "\\",
  };
function parseString(e, t = 0, n = e.length) {
  let o = e[t] === "'",
    r = e[t++] === e[t] && e[t] === e[t + 1];
  r &&
    ((n -= 2),
    e[(t += 2)] === "\r" && t++,
    e[t] ===
      `
` && t++);
  let i = 0,
    a,
    c = "",
    d = t;
  for (; t < n - 1;) {
    let l = e[t++];
    if (
      l ===
        `
` ||
      (l === "\r" &&
        e[t] ===
          `
`)
    ) {
      if (!r) throw new se("newlines are not allowed in strings", { toml: e, ptr: t - 1 });
    } else if ((l < " " && l !== "	") || l === "\x7F")
      throw new se("control characters are not allowed in strings", { toml: e, ptr: t - 1 });
    if (a) {
      if (((a = !1), l === "x" || l === "u" || l === "U")) {
        let u = e.slice(t, (t += l === "x" ? 2 : l === "u" ? 4 : 8));
        if (!MB.test(u)) throw new se("invalid unicode escape", { toml: e, ptr: i });
        try {
          c += String.fromCodePoint(parseInt(u, 16));
        } catch {
          throw new se("invalid unicode escape", { toml: e, ptr: i });
        }
      } else if (
        r &&
        (l ===
          `
` ||
          l === " " ||
          l === "	" ||
          l === "\r")
      ) {
        if (
          ((t = skipVoid(e, t - 1, !0)),
          e[t] !==
            `
` && e[t] !== "\r")
        )
          throw new se("invalid escape: only line-ending whitespace may be escaped", {
            toml: e,
            ptr: i,
          });
        t = skipVoid(e, t);
      } else if (l in u_) c += u_[l];
      else throw new se("unrecognized escape sequence", { toml: e, ptr: i });
      d = t;
    } else !o && l === "\\" && ((i = t - 1), (a = !0), (c += e.slice(d, i)));
  }
  return c + e.slice(d, n - 1);
}
s(parseString, "parseString");
function parseValue(e, t, n, o) {
  if (e === "true") return !0;
  if (e === "false") return !1;
  if (e === "-inf") return -1 / 0;
  if (e === "inf" || e === "+inf") return 1 / 0;
  if (e === "nan" || e === "+nan" || e === "-nan") return NaN;
  if (e === "-0") return o ? 0n : 0;
  let r = EB.test(e);
  if (r || AB.test(e)) {
    if (xB.test(e)) throw new se("leading zeroes are not allowed", { toml: t, ptr: n });
    e = e.replace(/_/g, "");
    let a = +e;
    if (isNaN(a)) throw new se("invalid number", { toml: t, ptr: n });
    if (r) {
      if ((r = !Number.isSafeInteger(a)) && !o)
        throw new se("integer value cannot be represented losslessly", { toml: t, ptr: n });
      (r || o === !0) && (a = BigInt(e));
    }
    return a;
  }
  let i = new ns(e);
  if (!i.isValid()) throw new se("invalid value", { toml: t, ptr: n });
  return i;
}
s(parseValue, "parseValue");
function sliceAndTrimEndOf(e, t, n) {
  let o = e.slice(t, n),
    r = o.indexOf("#");
  return (r > -1 && (skipComment(e, r), (o = o.slice(0, r))), [o.trimEnd(), r]);
}
s(sliceAndTrimEndOf, "sliceAndTrimEndOf");
function extractValue(e, t, n, o, r) {
  if (o === 0)
    throw new se("document contains excessively nested structures. aborting.", { toml: e, ptr: t });
  let i = e[t];
  if (i === "[" || i === "{") {
    let [d, l] = i === "[" ? parseArray(e, t, o, r) : parseInlineTable(e, t, o, r);
    if (n) {
      if (((l = skipVoid(e, l)), e[l] === ",")) l++;
      else if (e[l] !== n) throw new se("expected comma or end of structure", { toml: e, ptr: l });
    }
    return [d, l];
  }
  let a;
  if (i === '"' || i === "'") {
    a = getStringEnd(e, t);
    let d = parseString(e, t, a);
    if (n) {
      if (
        ((a = skipVoid(e, a)),
        e[a] &&
          e[a] !== "," &&
          e[a] !== n &&
          e[a] !==
            `
` &&
          e[a] !== "\r")
      )
        throw new se("unexpected character encountered", { toml: e, ptr: a });
      a += +(e[a] === ",");
    }
    return [d, a];
  }
  a = skipUntil(e, t, ",", n);
  let c = sliceAndTrimEndOf(e, t, a - +(e[a - 1] === ","));
  if (!c[0])
    throw new se("incomplete key-value declaration: no value specified", { toml: e, ptr: t });
  return (
    n && c[1] > -1 && ((a = skipVoid(e, t + c[1])), (a += +(e[a] === ","))),
    [parseValue(c[0], e, t, r), a]
  );
}
s(extractValue, "extractValue");
var DB = /^[a-zA-Z0-9-_]+[ \t]*$/;
function parseKey(e, t, n = "=") {
  let o = t - 1,
    r = [],
    i = e.indexOf(n, t);
  if (i < 0) throw new se("incomplete key-value: cannot find end of key", { toml: e, ptr: t });
  do {
    let a = e[(t = ++o)];
    if (a !== " " && a !== "	")
      if (a === '"' || a === "'") {
        if (a === e[t + 1] && a === e[t + 2])
          throw new se("multiline strings are not allowed in keys", { toml: e, ptr: t });
        let c = getStringEnd(e, t);
        if (c < 0) throw new se("unfinished string encountered", { toml: e, ptr: t });
        o = e.indexOf(".", c);
        let d = e.slice(c, o < 0 || o > i ? i : o),
          l = indexOfNewline(d);
        if (l > -1) throw new se("newlines are not allowed in keys", { toml: e, ptr: t + o + l });
        if (d.trimStart())
          throw new se("found extra tokens after the string part", { toml: e, ptr: c });
        if (i < c && ((i = e.indexOf(n, c)), i < 0))
          throw new se("incomplete key-value: cannot find end of key", { toml: e, ptr: t });
        r.push(parseString(e, t, c));
      } else {
        o = e.indexOf(".", t);
        let c = e.slice(t, o < 0 || o > i ? i : o);
        if (!DB.test(c))
          throw new se("only letter, numbers, dashes and underscores are allowed in keys", {
            toml: e,
            ptr: t,
          });
        r.push(c.trimEnd());
      }
  } while (o + 1 && o < i);
  return [r, skipVoid(e, i + 1, !0, !0)];
}
s(parseKey, "parseKey");
function parseInlineTable(e, t, n, o) {
  let r = {},
    i = new Set(),
    a;
  for (t++; (a = e[t++]) !== "}" && a;) {
    if (a === ",") throw new se("expected value, found comma", { toml: e, ptr: t - 1 });
    if (a === "#") t = skipComment(e, t);
    else if (
      a !== " " &&
      a !== "	" &&
      a !==
        `
` &&
      a !== "\r"
    ) {
      let c,
        d = r,
        l = !1,
        [u, f] = parseKey(e, t - 1);
      for (let _ = 0; _ < u.length; _++) {
        if (
          (_ && (d = l ? d[c] : (d[c] = {})),
          (c = u[_]),
          (l = Object.hasOwn(d, c)) && (typeof d[c] != "object" || i.has(d[c])))
        )
          throw new se("trying to redefine an already defined value", { toml: e, ptr: t });
        !l &&
          c === "__proto__" &&
          Object.defineProperty(d, c, { enumerable: !0, configurable: !0, writable: !0 });
      }
      if (l) throw new se("trying to redefine an already defined value", { toml: e, ptr: t });
      let [g, y] = extractValue(e, f, "}", n - 1, o);
      (i.add(g), (d[c] = g), (t = y));
    }
  }
  if (!a) throw new se("unfinished table encountered", { toml: e, ptr: t });
  return [r, t];
}
s(parseInlineTable, "parseInlineTable");
function parseArray(e, t, n, o) {
  let r = [],
    i;
  for (t++; (i = e[t++]) !== "]" && i;) {
    if (i === ",") throw new se("expected value, found comma", { toml: e, ptr: t - 1 });
    if (i === "#") t = skipComment(e, t);
    else if (
      i !== " " &&
      i !== "	" &&
      i !==
        `
` &&
      i !== "\r"
    ) {
      let a = extractValue(e, t - 1, "]", n - 1, o);
      (r.push(a[0]), (t = a[1]));
    }
  }
  if (!i) throw new se("unfinished array encountered", { toml: e, ptr: t });
  return [r, t];
}
s(parseArray, "parseArray");
function peekTable(e, t, n, o) {
  let r = t,
    i = n,
    a,
    c = !1,
    d;
  for (let l = 0; l < e.length; l++) {
    if (l) {
      if (((r = c ? r[a] : (r[a] = {})), (i = (d = i[a]).c), o === 0 && (d.t === 1 || d.t === 2)))
        return null;
      if (d.t === 2) {
        let u = r.length - 1;
        ((r = r[u]), (i = i[u].c));
      }
    }
    if (((a = e[l]), (c = Object.hasOwn(r, a)) && i[a]?.t === 0 && i[a]?.d)) return null;
    c ||
      (a === "__proto__" &&
        (Object.defineProperty(r, a, { enumerable: !0, configurable: !0, writable: !0 }),
        Object.defineProperty(i, a, { enumerable: !0, configurable: !0, writable: !0 })),
      (i[a] = { t: l < e.length - 1 && o === 2 ? 3 : o, d: !1, i: 0, c: {} }));
  }
  if (
    ((d = i[a]),
    (d.t !== o && !(o === 1 && d.t === 3)) ||
      (o === 2 &&
        (d.d || ((d.d = !0), (r[a] = [])),
        r[a].push((r = {})),
        (d.c[d.i++] = d = { t: 1, d: !1, i: 0, c: {} })),
      d.d))
  )
    return null;
  if (((d.d = !0), o === 1)) r = c ? r[a] : (r[a] = {});
  else if (o === 0 && c) return null;
  return [a, r, d.c];
}
s(peekTable, "peekTable");
function parse(e, { maxDepth: t = 1e3, integersAsBigInt: n } = {}) {
  let o = {},
    r = {},
    i = o,
    a = r;
  for (let c = skipVoid(e, 0); c < e.length;) {
    if (e[c] === "[") {
      let d = e[++c] === "[",
        l = parseKey(e, (c += +d), "]");
      if (d) {
        if (e[l[1] - 1] !== "]")
          throw new se("expected end of table declaration", { toml: e, ptr: l[1] - 1 });
        l[1]++;
      }
      let u = peekTable(l[0], o, r, d ? 2 : 1);
      if (!u)
        throw new se("trying to redefine an already defined table or value", { toml: e, ptr: c });
      ((a = u[2]), (i = u[1]), (c = l[1]));
    } else {
      let d = parseKey(e, c),
        l = peekTable(d[0], i, a, 0);
      if (!l)
        throw new se("trying to redefine an already defined table or value", { toml: e, ptr: c });
      let u = extractValue(e, d[1], void 0, t, n);
      ((l[1][l[0]] = u[0]), (c = u[1]));
    }
    if (
      ((c = skipVoid(e, c, !0)),
      e[c] &&
        e[c] !==
          `
` &&
        e[c] !== "\r")
    )
      throw new se("each key-value declaration must be followed by an end-of-line", {
        toml: e,
        ptr: c,
      });
    c = skipVoid(e, c);
  }
  return o;
}
s(parse, "parse");

export { parse };

// Reuse the parser's lexer so quoted keys, comments and multiline values retain
// exact source offsets. The editor only replaces values that actually changed.
export function scanToml(text) {
  parse(text);
  const tables = [];
  let current = { path: [], start: 0, insert: 0, end: text.length, fields: [] };
  tables.push(current);
  for (let pos = skipVoid(text, 0); pos < text.length;) {
    const start = pos;
    if (text[pos] === '[') {
      current.end = start;
      const array = text[pos + 1] === '[';
      const [path, end] = parseKey(text, pos + 1 + Number(array), ']');
      pos = end + Number(array);
      const newline = text.indexOf('\n', pos);
      current = { path, array, start, insert: newline < 0 ? text.length : newline + 1, end: text.length, fields: [] };
      tables.push(current);
    } else {
      const [path, valueStart] = parseKey(text, pos);
      const [, end] = extractValue(text, valueStart, undefined, 1000);
      let valueEnd = end;
      while (valueEnd > valueStart && /\s/.test(text[valueEnd - 1])) valueEnd--;
      current.fields.push({ path, start, valueStart, valueEnd });
      pos = end;
    }
    pos = skipVoid(text, pos);
  }
  return tables;
}
