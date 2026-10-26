/**
 * Electron main —— S0 壳。
 *
 * 职责被刻意压到最小（裁定 B：renderer↔main 是唯一边界）：
 *   ① 派生并持有**唯一**的内核子进程（supervisor 的单内核不变量）；
 *   ② 把 KernelConnection 适配成 KernelPort，再交给 KernelBridge 做信号路由；
 *   ③ 建窗、接线、退出时收尸。
 *
 * **不做**：不持有应用状态、不做投影、不认识任何具体协议方法名。
 * 状态与投影全在 renderer（理由见 main/seam/bridge.ts 文件头）。
 *
 * ## 启动顺序（有意为之）
 *
 *   connect() → createWindow() → renderer invoke(subscribe)
 *
 * 先派生内核再建窗：握手（约数百 ms）与窗口/资源加载**并行**，首屏更快。
 * 代价是握手期的信号无客户端接收 —— 那正是 bridge 的 buffer + sticky 存在的理由，
 * 且这条路径每次启动都会被真实走到（不是只在测试里）。
 */
import { app, BrowserWindow } from "electron";
import type { WebContents } from "electron";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { createModelController } from "./config/model-controller.ts";
import { fileURLToPath } from "node:url";
import { adaptConnection } from "../renderer/core/kernel-port.ts";
import type { BootstrapInfo } from "../preload/contract.ts";
import { getKernel } from "./acp/connection.ts";
import { createKernelBridge } from "./seam/bridge.ts";
import { holdServerRequests } from "./seam/hold.ts";
import { registerKernelIpc } from "./seam/register.ts";
import { installReapHooks, kernelChildPid, setKernelEnv, shutdownKernel } from "./kernel/supervisor.ts";
import { createIsolatedNofyHome } from "./kernel/test-home.ts";
import type { IsolatedHome } from "./kernel/test-home.ts";
import { log, warn } from "./lib/log.ts";
import type { KernelBridge } from "./seam/bridge.ts";

/** dist/main/index.mjs 所在目录（vite.main.config.ts 决定）。 */
const here = dirname(fileURLToPath(import.meta.url));
const PRELOAD_PATH = join(here, "..", "preload", "index.mjs");
const RENDERER_INDEX = join(here, "..", "renderer", "index.html");
const DEV_URL = process.env["NOFY_DEV_SERVER_URL"] ?? "";
const APP_VERSION = "0.1.0";

/**
 * 自检截图（NOFY_SCREENSHOT=/path.png）。
 *
 * 存在理由：壳的第一个真界面必须能被**无人值守地**验证——包括在 CI 与
 * 在没有显示器的会话里。渲染是否真的发生、令牌是否生效、脊柱是否出块，
 * 一张 PNG 比十行日志有说服力。
 * NOFY_SCREENSHOT_DELAY 控制等待毫秒（默认 2500，够内核握手 + 首屏）；
 * NOFY_SCREENSHOT_QUIT=1 则截完就退（脚本用）。
 */
const SCREENSHOT = process.env["NOFY_SCREENSHOT"] ?? "";
const SCREENSHOT_DELAY = Number(process.env["NOFY_SCREENSHOT_DELAY"] ?? "2500");
const SCREENSHOT_QUIT = process.env["NOFY_SCREENSHOT_QUIT"] === "1";

/**
 * 截图前合成的按键（NOFY_SCREENSHOT_KEYS="mod+k,mod+b"，逗号分隔）。
 *
 * 存在理由：界面自检要能截到**交互之后**的状态（⌘K 面板展开、⌘B 收起侧栏），
 * 否则每加一个界面都得人手点一次、截图也就无法进门。
 * 描述符口径与 renderer/ui/hotkeys.ts 一致（mod = ⌘/Ctrl）。
 */
const SCREENSHOT_KEYS = (process.env["NOFY_SCREENSHOT_KEYS"] ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

/** Electron sendInputEvent 接受的修饰键字面量（不是任意字符串）。 */
type KeyModifier = "shift" | "cmd" | "meta" | "command" | "ctrl" | "control" | "alt";

/** 把一个描述符翻成 Electron 的 keyDown/keyUp 事件对。 */
function sendKeySpec(wc: WebContents, spec: string): void {
  const parts = spec.split("+").filter((p) => p.length > 0);
  const keyCode = parts[parts.length - 1] ?? "";
  if (keyCode.length === 0) return;
  const modifiers: KeyModifier[] = [];
  for (const part of parts.slice(0, -1)) {
    const p = part.toLowerCase();
    if (p === "mod" || p === "cmd" || p === "meta" || p === "command") modifiers.push("meta");
    else if (p === "ctrl" || p === "control") modifiers.push("control");
    else if (p === "alt" || p === "opt" || p === "option") modifiers.push("alt");
    else if (p === "shift") modifiers.push("shift");
  }
  wc.sendInputEvent({ type: "keyDown", keyCode, modifiers });
  wc.sendInputEvent({ type: "keyUp", keyCode, modifiers });
  // 字符键必须补一个 char 事件：Chromium 的文本插入走 char，不走 keyDown。
  // 不补的话 ⌘K 这类 window 监听收得到、输入框的 onChange 收不到（实测抓到的坑）。
  if (keyCode.length === 1) {
    wc.sendInputEvent({ type: "char", keyCode, modifiers });
  }
}

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
/**
 * 确定性窗口位置（NOFY_WINDOW_X/Y）。
 *
 * 用途：无人值守的界面自检要把「截图里的像素」换算成「屏幕坐标」去点击，
 * 窗口位置不定就换算不了。产品默认仍由系统摆位，这里只是给自检一个锚点。
 */
const WINDOW_X = Number(process.env["NOFY_WINDOW_X"] ?? NaN);
const WINDOW_Y = Number(process.env["NOFY_WINDOW_Y"] ?? NaN);

/**
 * CDP 调试端口（NOFY_DEBUG_PORT=9444）。
 *
 * 用途：scripts/cdp-dump.ts 用同一套取数逻辑量**我们自己**的界面，与
 * docs/contract/zcode-live-vars.json / zcode-live-metrics.json 对账——
 * 「抄度量」从人眼对照变成机器对照。不给端口就完全不开放（产品默认无调试面）。
 */
const DEBUG_PORT = process.env["NOFY_DEBUG_PORT"] ?? "";
if (DEBUG_PORT.length > 0) {
  app.commandLine.appendSwitch("remote-debugging-port", DEBUG_PORT);
}

/**
 * 窗口背景色。与 tokens.css 的 .dark --color-background（= neutral-900）保持一致，
 * 避免首帧白闪。这里不解析 CSS：oklch + var 链在 main 侧求值是纯成本，
 * 写死一个近似值并在此注明关联即可（改主题时同步这一行）。
 */
const WINDOW_BACKGROUND = "#171717";

let bridge: KernelBridge | null = null;
let unregisterIpc: (() => void) | null = null;
let unhold: (() => void) | null = null;
let isolatedHome: IsolatedHome | null = null;
let mainWindow: BrowserWindow | null = null;

/**
 * 工作区。裁定 B：workspace 只是 cwd 参数，不是进程单位——
 * 故这里只解析出一个字符串，绝不为它派生第二个内核。
 */
function workspaceCwd(): string {
  const explicit = process.env["NOFY_WORKSPACE"];
  if (explicit !== undefined && explicit.length > 0) return explicit;
  const cwd = process.cwd();
  return app.isPackaged && (cwd === "/" || cwd.startsWith(app.getAppPath())) ? homedir() : cwd;
}

/**
 * 隔离 NOFY_HOME（NOFY_ISOLATED_HOME=1）。
 *
 * 用途：演示 / 录制 / 不污染真 ~/.nofy。copyConfig=true 是必须的——
 * 空 home 没有凭据，prompt 跑不起来（test-home.ts 文件头已记）。
 * 同时把 ui.permission_mode 覆盖成 "default"：本机真实配置是
 * "always-approve"，该模式下内核**完全不发**权限请求
 * （docs/contract/permission-flow-measured.md §0），审批界面会永远不出现。
 */
function prepareHome(): void {
  if (process.env["NOFY_ISOLATED_HOME"] !== "1") return;
  isolatedHome = createIsolatedNofyHome({
    copyConfig: true,
    configOverrides: { "ui.permission_mode": "default", "ui.yolo": false },
  });
  setKernelEnv({ ...process.env, NOFY_HOME: isolatedHome.path });
  warn("isolated NOFY_HOME=" + isolatedHome.path + "（含复制来的真实凭据，退出时删除）");
  // before-quit 只覆盖「正常退出」。SIGINT/SIGTERM 走 supervisor 的 reap 钩子
  // 直接 process.exit(0)，**不经过** before-quit —— 若只在那里清理，
  // 被信号终止时会把含真实凭据的临时目录留在 /tmp。exit 钩子两条路都覆盖。
  process.on("exit", () => {
    isolatedHome?.cleanup();
  });
}

function bootstrapInfo(): BootstrapInfo {
  const conn = getKernel();
  return {
    cwd: workspaceCwd(),
    clientVersion: conn.clientVersion,
    appVersion: APP_VERSION,
    platform: process.platform,
    arch: process.arch,
    kernelPid: kernelChildPid() ?? null,
    kernelConnected: conn.isOpen(),
    isolatedHome: isolatedHome?.path ?? null,
  };
}

async function createWindow(): Promise<void> {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 880,
    minHeight: 560,
    show: false,
    ...(Number.isFinite(WINDOW_X) && Number.isFinite(WINDOW_Y) ? { x: WINDOW_X, y: WINDOW_Y } : {}),
    // macOS 玻璃：窗口本体透明 + 原生 vibrancy，web 侧半透明 surface 叠出磨砂
    // （活壳同机制：body 背景 rgba(0,0,0,0)，材质在窗口层）。非 mac 保持实心底色。
    backgroundColor: process.platform === "darwin" ? "#00000000" : WINDOW_BACKGROUND,
    ...(process.platform === "darwin"
      ? { vibrancy: "under-window" as const, visualEffectState: "active" as const }
      : {}),
    // macOS 无边框但保留红绿灯；顶栏因此要留拖拽区（renderer/ui/styles.css）
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition: { x: 14, y: 18 },
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      // ESM preload（.mjs）要求 sandbox:false；renderer 仍无 node 能力，
      // 唯一入口是 preload 暴露的 window.nofy。
      sandbox: false,
      spellcheck: false,
    },
  });
  mainWindow = win;
  win.once("ready-to-show", () => {
    win.show();
  });
  win.on("closed", () => {
    if (mainWindow === win) mainWindow = null;
  });
  if (DEV_URL.length > 0) {
    log("loading dev server:", DEV_URL);
    await win.loadURL(DEV_URL);
  } else {
    await win.loadFile(RENDERER_INDEX);
  }

  if (SCREENSHOT.length > 0) {
    const wc = win.webContents;
    setTimeout(() => {
      void (async () => {
        try {
          // 合成按键前把窗口与 webContents 都置为 key 状态：
          // 无人值守启动的窗口默认不是 key window，字符键会落空（⌘K 这类
          // 挂在 window 上的监听能收到，但输入框的 onChange 收不到）。
          win.focus();
          wc.focus();
          for (const spec of SCREENSHOT_KEYS) {
            sendKeySpec(wc, spec);
            // 每个键之间留一拍：面板展开有过渡，抢跑会截到半开状态
            await wait(450);
          }
          if (SCREENSHOT_KEYS.length > 0) await wait(350);
          const image = await wc.capturePage();
          await writeFile(SCREENSHOT, image.toPNG());
          log(
            "screenshot written:",
            SCREENSHOT,
            String(image.getSize().width) + "x" + String(image.getSize().height),
            SCREENSHOT_KEYS.length > 0 ? "keys=" + SCREENSHOT_KEYS.join(",") : "",
          );
        } catch (e) {
          warn("screenshot failed:", e instanceof Error ? e.message : String(e));
        }
        if (SCREENSHOT_QUIT) app.quit();
      })();
    }, Number.isFinite(SCREENSHOT_DELAY) ? SCREENSHOT_DELAY : 2500);
  }
}

async function main(): Promise<void> {
  installReapHooks();
  prepareHome();

  const conn = getKernel();
  unhold = holdServerRequests(conn);
  bridge = createKernelBridge(adaptConnection(conn));
  const models = createModelController(() => isolatedHome?.path ?? process.env["NOFY_HOME"] ?? join(homedir(), ".nofy"), bridge);
  unregisterIpc = registerKernelIpc({ bridge, bootstrap: bootstrapInfo,
    models: { readModelConfig: models.read, updateModelConfig: models.update }, configurationBusy: models.busy });

  // 先派生内核：握手与建窗并行（见文件头「启动顺序」）
  conn.connect();
  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
}

app
  .whenReady()
  .then(() => main())
  .catch((e: unknown) => {
    warn("main failed to start:", e instanceof Error ? e.stack : String(e));
    app.exit(1);
  });

// 单内核应用：窗口全关就没有消费者了，留着内核只是留一个孤儿进程。
// macOS 的「关窗不退」惯例在此**不适用**——那条惯例的前提是重启窗口很便宜，
// 而我们的窗口背后是一条需要重新握手的内核连接。
app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  unhold?.();
  unhold = null;
  unregisterIpc?.();
  unregisterIpc = null;
  bridge?.dispose();
  bridge = null;
  try {
    getKernel().close();
  } catch (e) {
    warn("kernel close failed:", e instanceof Error ? e.message : String(e));
  }
  shutdownKernel();
  setKernelEnv(null);
  if (isolatedHome !== null) {
    isolatedHome.cleanup();
    isolatedHome = null;
  }
});
