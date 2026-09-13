/**
 * 键位表的**记档面**（数据，不是组件）。
 *
 * 为什么单独一个 .ts 而不是写在 HelpMenu.tsx 里：test/hotkeys-help.test.ts 要在
 * node --test 下 import 它，而 node 的类型剥离**不转 JSX**——.tsx 在测试里 import
 * 不动。把数据与视图分开，这道防漂移门才跑得起来（与 palette.ts / sidebarModel.ts
 * 同一个理由：纯模型可测，组件是它的视图）。
 *
 * 执行面是 App.tsx 的 hotkeyMap。两面各自写一定会漂（改了绑定忘改文案，或反过来），
 * 所以测试**双向**对账：HOTKEY_HELP 里每条 binding 都必须在 App.tsx 注册过，
 * App.tsx 里每个 mod 组合键也都必须在 HOTKEY_HELP 里写出来。
 */

export type HotkeyHelp = {
  /** App.tsx hotkeyMap 里的键（测试据此对账）。null = 不是 window 级绑定，只是说明。 */
  binding: string | null;
  /** 界面显示的组合键（macOS 记号）。 */
  label: string;
  what: string;
};

/** 顺序＝重要度（帮助菜单从上往下就是这个序）。 */
export const HOTKEY_HELP: HotkeyHelp[] = [
  { binding: "mod+k", label: "⌘K", what: "命令中心（命令 / 会话 / 面板动作）" },
  { binding: "mod+shift+p", label: "⌘⇧P", what: "打开命令中心" },
  { binding: "mod+n", label: "⌘N", what: "新建任务" },
  { binding: "mod+b", label: "⌘B", what: "收起 / 展开侧栏" },
  { binding: "mod+alt+b", label: "⌘⌥B", what: "收起 / 展开侧边面板" },
  {
    // 活壳的终端开关键位**未实测**（只量到 data-testid="terminal-toggle" 那枚按钮），
    // 所以这条是**我们自己的**绑定，不是抄来的；帮助里显示的就是本应用真实行为。
    binding: "mod+j",
    label: "⌘J",
    what: "收起 / 展开终端面板",
  },
  { binding: "mod+shift+[", label: "⌘⇧[", what: "上一个会话" },
  { binding: "mod+shift+]", label: "⌘⇧]", what: "下一个会话" },
  { binding: null, label: "1 – 9", what: "审批模态：选第 N 项（Esc 取消）" },
];
