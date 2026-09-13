/**
 * HelpMenu —— 卡片头右簇第 1 枚（活壳 aria-label「帮助」，lucide-circle-question-mark）。
 *
 * ## 为什么是「键位表 + 关于」而不是帮助文档
 *
 * 活壳那枚打开的是 ZCode 的帮助站/反馈入口。我们没有文档站，放一个打不开外链的
 * 「帮助」就是假按钮。这个位置真正缺的信息是**键位**——本窗口的键位全在
 * App.tsx 的 hotkeyMap 里，界面上一条都没写出来过；以及**版本/内核 pid**，
 * 报问题时第一句要问的就是这两个。所以菜单内容 = HOTKEY_HELP + 关于两行。
 *
 * ## 防漂移
 *
 * 键位表住在 hotkeys-help.ts（纯数据，可被 node --test import），App.tsx 的 hotkeyMap
 * 是执行面。test/hotkeys-help.test.ts 双向对账两面 ⇒ 漂了就红。
 */
import type { BootstrapInfo } from "../../../preload/contract.ts";
import { IconHelp } from "../../ui/icons.tsx";
import { MenuButton } from "../../ui/menu.tsx";
import type { MenuItem } from "../../ui/menu.tsx";
import { HOTKEY_HELP } from "./hotkeys-help.ts";

export type HelpMenuProps = {
  boot: BootstrapInfo | null;
  kernelVersion: string | null;
};

export function HelpMenu({ boot, kernelVersion }: HelpMenuProps) {
  const items: MenuItem[] = HOTKEY_HELP.map((h) => ({ id: "key:" + h.label, label: h.what, hint: h.label }));
  items.push({
    id: "about",
    label: "nofy-desktop " + (boot?.appVersion ?? "0.1.0"),
    hint: "内核 " + (kernelVersion ?? "…") + " · pid " + String(boot?.kernelPid ?? "?"),
  });
  if (boot !== null) {
    items.push({ id: "platform", label: boot.platform + " / " + boot.arch, hint: "Electron 渲染进程" });
  }
  if (boot?.isolatedHome != null) {
    items.push({ id: "isolated", label: "隔离 NOFY_HOME", hint: boot.isolatedHome });
  }
  return (
    <MenuButton
      align="right"
      variant="icon"
      chevron={false}
      title="帮助：本窗口的键位表与版本信息"
      trigger={<IconHelp size={16} />}
      items={items}
      onPick={() => {
        /* 帮助项只读 */
      }}
    />
  );
}
