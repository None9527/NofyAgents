/** Opt-in test counters. Disabled unless the isolated test enables a sink; no content recorded. */
export type RenderName = "App" | "Spine" | "BlockView" | "Markdown" | "MarkdownFragment" | "SettingsSurface" | "Sidebar" | "Composer" | "ApprovalHost" | "QueueHost";
export function recordRender(name: RenderName): void {
  const trace = (globalThis as unknown as { __NOFY_UI_TRACE?: { counts: Partial<Record<RenderName, number>> } }).__NOFY_UI_TRACE;
  if (trace?.counts) trace.counts[name] = (trace.counts[name] ?? 0) + 1;
}
