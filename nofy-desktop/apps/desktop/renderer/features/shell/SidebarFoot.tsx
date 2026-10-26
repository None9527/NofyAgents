import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
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
 *   [连接与诊断（账号卡槽位）] [外观与内核设置]
 *
 * - 账号卡槽位放**连接点 + 产品名 + 内核版本**：我们没有云账号，但这个位置的语义是
 *   「我是谁 / 我连着什么」，诊断量正好是这个语义（原先它挂在整窗状态栏，活壳没有
 *   状态栏行）。点开是只读的诊断菜单：事件计数 / 表外事件 / 边界自检 / pid / 平台 /
 *   本轮用量 / stopReason。
 * - 「移动端远程控制」不画：没有对应能力，画一个灰图标是装饰。
 * - 齿轮菜单：主题、字号、语言留在窗口层；「设置…」打开内核配置盖层。
 */
import { useEffect, useMemo, useState } from "react";
import type { BootstrapInfo, NofyBridge } from "../../../preload/contract.ts";
import type { Projection } from "../../application/contracts/public.ts";
import { createDiagnosticsSelector } from "../../application/shell/public.ts";
import { useProjection } from "../../application/projection/public.ts";
import { FONT_SIZES, loadFontSize, saveFontSize } from "../../ui/appearancePrefs.ts";
import { setLocale } from "../../ui/i18n.ts";
import type { Locale } from "../../ui/i18n.ts";
import { IconGear, IconWarn } from "../../ui/icons.tsx";
import { MenuButton } from "../../ui/menu.tsx";
import type { MenuItem } from "../../ui/menu.tsx";
import { THEMES } from "../../ui/theme.ts";
import type { ThemeName } from "../../ui/theme.ts";
import type { SettingsSectionId } from "../settings/public.ts";

const POLL_MS = 2000;

export type SidebarFootProps = {
  projection: Projection;
  boot: BootstrapInfo | null;
  bridge: NofyBridge;
  theme: ThemeName;
  onTheme: (t: ThemeName) => void;
  /** 齿轮菜单「设置…」开设置面（阶段 C UI 批）。 */
  onOpenSettings: (section: SettingsSectionId) => void;
};

export function SidebarFoot({ projection, boot, bridge, theme, onTheme, onOpenSettings }: SidebarFootProps) {
  const locale = useLocale();
  const [fontSize, setFontSize] = useState(loadFontSize);
  const selector = useMemo(createDiagnosticsSelector, []);
  const state = useProjection(projection, selector);
  const [diag, setDiag] = useState(() => bridge.diagnostics());
  useEffect(() => {
    const t = setInterval(() => setDiag(bridge.diagnostics()), POLL_MS);
    return () => clearInterval(t);
  }, [bridge]);

  const active = state.active;
  const unhandledKinds = Object.keys(state.unhandled).length;
  const unhandledTotal = Object.values(state.unhandled).reduce((n, v) => n + v, 0);
  // warn 只留给**边界自检**失败（契约漂移）。表外事件计数是常态信息
  // （内核会推 last_turn_summary 等），用红色报警是把噪声当事故。
  const bridgeBad = diag.rejected > 0 || diag.droppedEarly > 0;
  const connected = state.connection.status === "ready";

  const diagItems: MenuItem[] = [
    { id: "events", label: tr("已应用事件 ") + String(state.appliedEvents), hint: tr("投影层计数") },
    {
      id: "unhandled",
      label: tr("表外事件 ") + String(unhandledTotal) + "（" + String(unhandledKinds) + tr(" 类）"),
      hint: unhandledTotal > 0 ? Object.entries(state.unhandled).map(([k, v]) => k + " ×" + String(v)).join("；") : tr("无"),
    },
    {
      id: "bridge",
      label: tr("边界自检 rejected ") + String(diag.rejected) + " / dropped " + String(diag.droppedEarly),
      hint: bridgeBad ? tr("契约漂移的第一现场") : tr("正常"),
    },
    { id: "pid", label: tr("内核 pid ") + String(boot?.kernelPid ?? "?"), hint: tr("单内核不变量（PLAN §7 验收门 5）") },
    { id: "platform", label: (boot?.platform ?? "?") + "/" + (boot?.arch ?? "?"), hint: "app " + (boot?.appVersion ?? "0.1.0") },
  ];
  if (active?.turnUsage != null) {
    diagItems.push({
      id: "usage",
      label:
        tr("本轮 ") + active.turnUsage.totalTokens.toLocaleString() + " tok · " +
        String(active.turnUsage.modelCalls) + tr(" 次调用 · ") + String(active.turnUsage.apiDurationMs) + " ms",
      hint: tr("turn_completed.usage（轮级，camelCase）"),
    });
  }
  if (active?.stopReason != null) diagItems.push({ id: "stop", label: "stopReason " + active.stopReason, hint: tr("轮级") });

  const settingsItems: MenuItem[] = [
    ...THEMES.map((t) => ({ id: "theme:" + t.id, label: t.label, selected: t.id === theme })),
    ...FONT_SIZES.map((size, index) => ({ id: "font:" + String(size), label: String(size) + " px", selected: size === fontSize, separatorBefore: index === 0 })),
    { id: "locale:zh-CN", label: "中文", selected: locale === "zh-CN", separatorBefore: true },
    { id: "locale:en", label: "English", selected: locale === "en" },
    { id: "open:settings", label: tr("设置…"), hint: tr("模型、插件、技能、MCP、用量"), separatorBefore: true },
  ];

  return (
    <footer className="sidebar__foot">
      <div className="sidebar__footer-card">
      <MenuButton
        align="left"
        variant="plain"
        chevron={false}
        up
        title={tr("连接与诊断量（只读）：事件计数 / 表外事件 / 边界自检 / pid / 平台 / 轮级用量")}
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
        title={tr("外观：主题、字号、语言。内核配置在「设置…」。")}
        trigger={<IconGear size={16} />}
        items={settingsItems}
        onPick={(id) => {
          if (id.startsWith("theme:")) onTheme(id.slice("theme:".length) as ThemeName);
          if (id.startsWith("font:")) { const size = Number(id.slice("font:".length)); saveFontSize(size); setFontSize(size); }
          if (id === "locale:zh-CN" || id === "locale:en") setLocale(id.slice("locale:".length) as Locale);
          if (id === "open:settings") onOpenSettings("general");
        }}
      />
      </div>
    </footer>
  );
}
