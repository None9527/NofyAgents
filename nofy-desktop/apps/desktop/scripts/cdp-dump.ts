/**
 * cdp-dump —— 经 Chrome DevTools Protocol 把「界面实际长什么样」量出来。
 *
 * ## 为什么是运行时而不是 bundle
 *
 * bundle 里的 CSS 给的是**作者写的值**（我们已机械提取成 ui/tokens.css）；
 * 逆向树给的是**作者写的类名**（QuickPick.tsx 的类常量逐条可读）。
 * 两者都缺一样东西：**级联之后的最终值**——同一个元素在暗/亮主题下、在
 * hover/focus/展开态下、在真实字体回退之后，盒模型与颜色到底是多少。
 * 那正是「像素级」要对照的东西，只有运行时给得了（CSS.getComputedStyleForNode /
 * getBoundingClientRect / getComputedStyle(documentElement) 的变量解析值）。
 *
 * 用法：
 *   node scripts/cdp-dump.ts --port 9333 --mode outline            # DOM 结构大纲
 *   node scripts/cdp-dump.ts --port 9333 --mode vars               # :root 变量解析值
 *   node scripts/cdp-dump.ts --port 9333 --mode nodes --selectors "a,b,c" --out x.json
 *   node scripts/cdp-dump.ts --port 9333 --mode keys               # @keyframes 原文
 *
 * 零依赖：Node 24 的全局 WebSocket + browser WS 端点（Electron 禁了 /json 发现端点时
 * 也能用——启动日志里那行 "DevTools listening on ws://…" 就是入口）。
 *
 * 纪律：对 ZCode **只读**。不点编辑/删除/发送类控件；取数只走 DOM/CSS/Runtime 三个域。
 */
import { writeFile } from "node:fs/promises";

type Args = { port: string; mode: string; selectors: string[]; out: string | null };

function parseArgs(argv: string[]): Args {
  const a: Args = { port: "9333", mode: "outline", selectors: [], out: null };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i] ?? "";
    if (arg === "--port") a.port = argv[++i] ?? a.port;
    else if (arg === "--mode") a.mode = argv[++i] ?? a.mode;
    else if (arg === "--selectors") a.selectors = (argv[++i] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    else if (arg === "--out") a.out = argv[++i] ?? null;
  }
  return a;
}

/** 极简 CDP 客户端：browser 端点 + flatten session。 */
class Cdp {
  private ws: WebSocket;
  private nextId = 1;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  sessionId: string | null = null;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(String(ev.data)) as {
        id?: number;
        result?: unknown;
        error?: { message?: string };
        method?: string;
        params?: { sessionId?: string };
      };
      if (msg.id !== undefined) {
        const p = this.pending.get(msg.id);
        if (p === undefined) return;
        this.pending.delete(msg.id);
        if (msg.error !== undefined) p.reject(new Error(msg.error.message ?? "cdp error"));
        else p.resolve(msg.result);
      }
    });
  }

  open(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws.addEventListener("open", () => resolve(), { once: true });
      this.ws.addEventListener("error", () => reject(new Error("ws error")), { once: true });
    });
  }

  send(method: string, params: unknown = {}): Promise<never> {
    const id = this.nextId++;
    const payload: Record<string, unknown> = { id, method, params };
    if (this.sessionId !== null) payload["sessionId"] = this.sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }

  async attachToPage(): Promise<void> {
    const targets = (await this.send("Target.getTargets")) as {
      targetInfos: Array<{ type: string; url: string; targetId: string }>;
    };
    const page = targets.targetInfos.find((t) => t.type === "page" && t.url.startsWith("http"))
      ?? targets.targetInfos.find((t) => t.type === "page");
    if (page === undefined) throw new Error("没有 page target");
    const attached = (await this.send("Target.attachToTarget", { targetId: page.targetId, flatten: true })) as {
      sessionId: string;
    };
    this.sessionId = attached.sessionId;
    await this.send("DOM.enable");
    await this.send("CSS.enable");
    await this.send("Runtime.enable");
  }

  /** 在页面里跑一段 JS 并把结果按值取回。 */
  async evaluate(expression: string): Promise<unknown> {
    const res = (await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: false,
    })) as { result?: { value?: unknown }; exceptionDetails?: { text?: string } };
    if (res.exceptionDetails !== undefined) throw new Error("page eval: " + (res.exceptionDetails.text ?? "?"));
    return res.result?.value;
  }

  close(): void {
    this.ws.close();
  }
}

/** 我们关心的 computed 子集：够重建度量，又不至于把 300 个属性全拖回来。 */
const COMPUTED_KEYS = [
  "fontSize", "lineHeight", "fontWeight", "letterSpacing", "fontFamily",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "marginTop", "marginRight", "marginBottom", "marginLeft",
  "gap", "rowGap", "columnGap",
  "borderTopWidth", "borderTopColor", "borderTopLeftRadius", "borderTopRightRadius",
  "borderBottomLeftRadius", "borderBottomRightRadius",
  "backgroundColor", "color", "boxShadow", "opacity",
  "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
  "display", "position", "top", "left", "right", "bottom",
  "transitionProperty", "transitionDuration", "transitionTimingFunction",
  "overflowX", "overflowY", "zIndex", "backdropFilter",
] as const;

const OUTLINE_JS = `
(() => {
  const out = [];
  const walk = (el, depth, path) => {
    if (depth > 12 || out.length > 2500) return;
    const r = el.getBoundingClientRect();
    const cls = typeof el.className === "string" ? el.className : "";
    out.push({
      path,
      tag: el.tagName.toLowerCase(),
      cls: cls.slice(0, 160),
      slot: el.getAttribute ? (el.getAttribute("data-slot") || "") : "",
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
    });
    let i = 0;
    for (const child of el.children) {
      walk(child, depth + 1, path + "/" + el.tagName.toLowerCase() + (cls ? "[" + cls.split(" ")[0] + "]" : "") + ":" + i);
      i++;
    }
  };
  walk(document.body, 0, "");
  return out;
})()
`;

function nodesJs(selectors: string[]): string {
  // 用拼接而不是模板串：这段 JS 是要**送进页面**的，里面不能再有宿主侧插值。
  const keysJson = JSON.stringify([...COMPUTED_KEYS]);
  const lines = [
    "((selectors) => {",
    "  const KEYS = " + keysJson + ";",
    "  const out = [];",
    "  for (const sel of selectors) {",
    "    let el = null;",
    "    try { el = document.querySelector(sel); } catch (e) { el = null; }",
    "    if (el === null) { out.push({ selector: sel, missing: true }); continue; }",
    "    const cs = getComputedStyle(el);",
    "    const r = el.getBoundingClientRect();",
    "    const computed = {};",
    "    for (const k of KEYS) computed[k] = cs.getPropertyValue(k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()));",
    "    out.push({",
    "      selector: sel,",
    "      tag: el.tagName.toLowerCase(),",
    "      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 240),",
    "      slot: el.getAttribute('data-slot') || null,",
    // 只记文本长度：侧栏行/会话标题是**用户数据**，取证件不取内容（与截图不落库同纪律）。
    "      textLen: (el.textContent || '').trim().length,",
    "      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },",
    "      computed: computed,",
    "    });",
    "  }",
    "  return out;",
    "})(" + JSON.stringify(selectors) + ")",
  ];
  return lines.join("\n");
}

const VARS_JS = `
(() => {
  const cs = getComputedStyle(document.documentElement);
  const names = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    const scan = (list) => {
      for (const rule of list) {
        if (rule.cssRules) scan(rule.cssRules);
        const style = rule.style;
        if (!style) continue;
        for (let i = 0; i < style.length; i++) {
          const p = style[i];
          if (p.startsWith("--") && !names.includes(p)) names.push(p);
        }
      }
    };
    scan(rules);
  }
  const resolved = {};
  for (const n of names) resolved[n] = cs.getPropertyValue(n).trim();
  return {
    themeAttr: document.documentElement.getAttribute("class") || document.documentElement.getAttribute("data-theme") || "",
    count: names.length,
    resolved,
  };
})()
`;

const KEYS_JS = `
(() => {
  const out = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    const scan = (list) => {
      for (const rule of list) {
        if (rule.cssRules) scan(rule.cssRules);
        if (rule.type === CSSRule.KEYFRAMES_RULE) out.push({ name: rule.name, css: rule.cssText.slice(0, 1200) });
      }
    };
    scan(rules);
  }
  return out;
})()
`;

async function main(): Promise<number> {
  const args = parseArgs(process.argv);
  // **--ws 优先**：本机可能同时开着多个带调试端口的 Electron（ZCode 9333 / 我们 9444），
  // 若先试 /json/version 会静默连到**另一个**应用上——本轮就因此把「我们的取数」
  // 全打到了 ZCode 上（themeAttr 一模一样才发现）。没给 --ws 才回退到 --port 的发现端点。
  let browserWs = "";
  const wsArg = process.argv.find((a) => a.startsWith("--ws="));
  if (wsArg !== undefined) {
    browserWs = wsArg.slice(5);
  } else {
    try {
      const res = await fetch("http://127.0.0.1:" + args.port + "/json/version");
      const j = (await res.json()) as { webSocketDebuggerUrl?: string };
      browserWs = j.webSocketDebuggerUrl ?? "";
    } catch {
      browserWs = "";
    }
    if (browserWs.length === 0) {
      console.error("需要 --ws=ws://127.0.0.1:<port>/devtools/browser/<uuid>（见启动日志那行 DevTools listening）");
      return 2;
    }
  }
  const cdp = new Cdp(browserWs);
  await cdp.open();
  await cdp.attachToPage();

  if (args.mode === "outline") {
    const outline = (await cdp.evaluate(OUTLINE_JS)) as unknown[];
    console.log(JSON.stringify(outline, null, 1));
  } else if (args.mode === "vars") {
    const vars = await cdp.evaluate(VARS_JS);
    const text = JSON.stringify(vars, null, 1);
    if (args.out !== null) await writeFile(args.out, text + "\n");
    console.log(text.slice(0, 4000));
    if (args.out !== null) console.log("→ 写入", args.out);
  } else if (args.mode === "keys") {
    const keys = await cdp.evaluate(KEYS_JS);
    console.log(JSON.stringify(keys, null, 1));
  } else if (args.mode === "eval") {
    //  ad-hoc 驱动：把一段 JS 送进页面（点导航、开弹层），用于取「某个状态之后」的度量。
    //  纪律同截图：只点导航/开合类控件，不点编辑/删除/发送。
    const jsArg = process.argv.find((a) => a.startsWith("--js="));
    if (jsArg === undefined) {
      console.error("需要 --js=<expression>");
      return 2;
    }
    const value = await cdp.evaluate(jsArg.slice(5));
    console.log(JSON.stringify(value, null, 1));
  } else if (args.mode === "shot") {
    // 像素门的另一半：盒模型对完还要**肉眼对**。NOFY_SCREENSHOT 只能截启动态，
    // 而「点了 tabs 第二档 / 开了某个菜单之后」的样子只能从 CDP 截。
    // 用法：node scripts/cdp-dump.ts --ws=… --mode shot --out /tmp/x.png
    // （--js 可选：截图前先送一段页面 JS，例如点导航/开弹层。）
    const jsArg = process.argv.find((a) => a.startsWith("--js="));
    if (jsArg !== undefined) await cdp.evaluate(jsArg.slice(5));
    if (args.out === null) {
      console.error("shot 模式需要 --out=<path.png>");
      return 2;
    }
    const png = (await cdp.send("Page.captureScreenshot", { format: "png" })) as unknown as { data?: string };
    if (typeof png.data !== "string" || png.data.length === 0) throw new Error("captureScreenshot 没给 data");
    await writeFile(args.out, Buffer.from(png.data, "base64"));
    console.log("→ 写入", args.out);
  } else {
    const nodes = await cdp.evaluate(nodesJs(args.selectors));
    const text = JSON.stringify(nodes, null, 1);
    if (args.out !== null) await writeFile(args.out, text + "\n");
    console.log(text.slice(0, 6000));
    if (args.out !== null) console.log("→ 写入", args.out);
  }
  cdp.close();
  return 0;
}

main()
  .then((c) => process.exit(c))
  .catch((e) => {
    console.error("CRASHED:", e instanceof Error ? e.stack : String(e));
    process.exit(1);
  });
