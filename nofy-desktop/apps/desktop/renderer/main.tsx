/**
 * renderer 入口。
 *
 * 只做三件事：取桥、装 runtime、挂 React。
 * 任何协议/状态逻辑都不该出现在这里（否则它就不在 store 纪律的管辖范围内了）。
 */
import { createRoot } from "react-dom/client";
import { BRIDGE_GLOBAL } from "../preload/contract.ts";
import type { NofyBridge } from "../preload/contract.ts";
import { App } from "./features/shell/App.tsx";
import { createRuntime } from "./seam/runtime.ts";
/* xterm 的结构样式（.xterm-viewport/.xterm-screen 的定位与滚动）。
 * 放在入口而不是组件里：它是第三方样式表，与我们的 styles.css 同级，
 * 组件文件只该有我们的类名（干净室边界，见 styles.css 头注）。 */
import "@xterm/xterm/css/xterm.css";
import "./ui/styles.css";

function bridgeFromWindow(): NofyBridge {
  const w = window as unknown as Record<string, unknown>;
  const raw = w[BRIDGE_GLOBAL];
  if (typeof raw !== "object" || raw === null) {
    throw new Error(
      "window." + BRIDGE_GLOBAL + " 缺失：preload 没挂上桥。检查 webPreferences.preload 路径与 sandbox:false。",
    );
  }
  return raw as NofyBridge;
}

const host = document.getElementById("root");
if (host === null) throw new Error("#root 缺失");

const runtime = createRuntime(bridgeFromWindow());

// 刻意不套 StrictMode：它会把挂载 effect 跑两遍，而 App 的挂载 effect 会真的
// 向内核发 session/new —— 双跑就是双会话（见 App.tsx 文件头）。
createRoot(host).render(<App runtime={runtime} />);
