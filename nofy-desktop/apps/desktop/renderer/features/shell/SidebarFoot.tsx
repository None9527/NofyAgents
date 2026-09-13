/**
 * SidebarFoot —— 侧栏页脚（活壳 footer：flex-col gap-2.5 px-4 pt-2 pb-4，高 56）。
 *
 * ## 活壳这一行是什么（CDP 实测，docs/contract/zcode-live-metrics.md §1.2）
 *
 *   [账号卡按钮 154×32「tgiieedo」] [移动端远程控制 smartphone 32×32] [设置 settings 32×32]
 *
 * 三枚都是 **32×32**（不是卡片头那簇的 28×28）。主题切换在活壳里住在「设置」里面，
 * 不在卡片头——我们此前把主题/设置塞进卡片头右簇是**看错了槽位**（用户指正的那处），
 * 本轮改正：卡片头右簇只留 帮助 / 切换终端 / 展开·收起侧边面板。
 *
 * ## 我们的对应
 *
 *   [连接与诊断（账号卡槽位）] [设置（主题 + 未接线的面）]
 *
 * - 账号卡槽位放**连接点 + 产品名 + 内核版本**：我们没有云账号，但这个位置的语义是
 *   「我是谁 / 我连着什么」，诊断量正好是这个语义（原先它挂在整窗状态栏，活壳没有
 *   状态栏行）。点开是只读的诊断菜单：事件计数 / 表外事件 / 边界自检 / pid / 平台 /
 *   本轮用量 / stopReason。
 * - 「移动端远程控制」不画：没有对应能力，画一个灰图标是装饰。
 * - 设置菜单：主题四档（勾选当前）+ 设置面（灰，P6；分组词汇沿用活壳）。
 */
import { useEffect, useState } from "react";
import type { BootstrapInfo, NofyBridge } from "../../../preload/contract.ts";
import type { AppState } from "../../core/store/state.ts";
import { IconGear, IconWarn } from "../../ui/icons.tsx";
import { MenuButton } from "../../ui/menu.tsx";
import type { MenuItem } from "../../ui/menu.tsx";
import { THEMES } from "../../ui/theme.ts";
import type { ThemeName } from "../../ui/theme.ts";
import type { SettingsSectionId } from "../settings/settingsModel.ts";

const POLL_MS = 2000;

export type SidebarFootProps = {
  state: AppState;
  boot: BootstrapInfo | null;
  bridge: NofyBridge;
  theme: ThemeName;
  onTheme: (t: ThemeName) => void;
  /** 齿轮菜单「设置…」开设置面（阶段 C UI 批）。 */
  onOpenSettings: (section: SettingsSectionId) => void;
};

export function SidebarFoot({ state, boot, bridge, theme, onTheme, onOpenSettings }: SidebarFootProps) {
  const [diag, setDiag] = useState(() => bridge.diagnostics());
  useEffect(() => {
    const t = setInterval(() => setDiag(bridge.diagnostics()), POLL_MS);
    return () => clearInterval(t);
  }, [bridge]);

  const active = state.activeSessionId === null ? null : state.sessions[state.activeSessionId] ?? null;
  const unhandledKinds = Object.keys(state.unhandled).length;
  const unhandledTotal = Object.values(state.unhandled).reduce((n, v) => n + v, 0);
  // warn 只留给**边界自检**失败（契约漂移）。表外事件计数是常态信息
  // （内核会推 last_turn_summary 等），用红色报警是把噪声当事故。
  const bridgeBad = diag.rejected > 0 || diag.droppedEarly > 0;
  const connected = state.connection.status === "ready";

  const diagItems: MenuItem[] = [
    { id: "events", label: "已应用事件 " + String(state.appliedEvents), hint: "投影层计数" },
    {
      id: "unhandled",
      label: "表外事件 " + String(unhandledTotal) + "（" + String(unhandledKinds) + " 类）",
      hint: unhandledTotal > 0 ? Object.entries(state.unhandled).map(([k, v]) => k + " ×" + String(v)).join("；") : "无",
    },
    {
      id: "bridge",
      label: "边界自检 rejected " + String(diag.rejected) + " / dropped " + String(diag.droppedEarly),
      hint: bridgeBad ? "契约漂移的第一现场" : "正常",
    },
    { id: "pid", label: "内核 pid " + String(boot?.kernelPid ?? "?"), hint: "单内核不变量（PLAN §7 验收门 5）" },
    { id: "platform", label: (boot?.platform ?? "?") + "/" + (boot?.arch ?? "?"), hint: "app " + (boot?.appVersion ?? "0.1.0") },
  ];
  if (active?.turnUsage != null) {
    diagItems.push({
      id: "usage",
      label:
        "本轮 " + active.turnUsage.totalTokens.toLocaleString() + " tok · " +
        String(active.turnUsage.modelCalls) + " 次调用 · " + String(active.turnUsage.apiDurationMs) + " ms",
      hint: "turn_completed.usage（轮级，camelCase）",
    });
  }
  if (active?.stopReason != null) diagItems.push({ id: "stop", label: "stopReason " + active.stopReason, hint: "轮级" });

  const settingsItems: MenuItem[] = [
    ...THEMES.map((t) => ({ id: "theme:" + t.id, label: t.label, hint: "主题", selected: t.id === theme })),
    { id: "open:settings", label: "设置…", hint: "插件 / 技能 / MCP 只读面" },
  ];

  return (
    <footer className="sidebar__foot">
      <MenuButton
        align="left"
        variant="plain"
        chevron={false}
        up
        title="连接与诊断量（只读）：事件计数 / 表外事件 / 边界自检 / pid / 平台 / 轮级用量"
        trigger={
          <span className={"footcard" + (bridgeBad ? " footcard--warn" : "")}>
            <span className="footcard__avatar">
              <span
                className={"dot" + (connected ? " dot--completed" : " dot--working")}
                title={"connection.status=" + state.connection.status}
              />
            </span>
            <span className="footcard__name">nofy-desktop</span>
            <span className="footcard__ver">{state.connection.agentVersion ?? "…"}</span>
            {bridgeBad ? <IconWarn size={12} /> : null}
          </span>
        }
        items={diagItems}
        onPick={() => {
          /* 诊断项只读 */
        }}
      />
      <MenuButton
        align="right"
        variant="icon-lg"
        chevron={false}
        up
        title="设置：主题（亮 / 暗 / zai 亮 / zai 暗）；设置面 P6 未接线"
        trigger={<IconGear size={16} />}
        items={settingsItems}
        onPick={(id) => {
          if (id.startsWith("theme:")) onTheme(id.slice("theme:".length) as ThemeName);
          if (id === "open:settings") onOpenSettings("general");
        }}
      />
    </footer>
  );
}
