/**
 * 窗口标题（document.title）的设置口。
 *
 * 住在 ui/ 的理由同 prefs/theme：features 不准碰 document（dep-guard）。
 * 抄自活壳解剖：ZCode 的**会话标题不在顶栏**——顶栏单行放 cwd 面包屑，
 * 标题去窗口标题与侧栏行。我们把标题交给 document.title + macOS 窗口标题。
 */
export function setDocTitle(title: string): void {
  document.title = title;
}
