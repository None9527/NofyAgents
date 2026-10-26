import type { Block } from "../../core/store/state.ts";
type Tool = Extract<Block, { kind: "tool-call" }>;
export function toolPresentation(block: Tool) {
  const kind=(block.toolKind??"").toLowerCase();
  const identity=(!kind||kind==="other"?block.name??block.title??"":kind).toLowerCase();
  const family = /search_replace|edit|write|patch/.test(identity) ? "edit" : /exec|bash|shell|terminal/.test(identity) ? "execute" : /read|glob|grep|search|list|find/.test(identity) ? "explore" : "other";
  const input = block.rawInput && typeof block.rawInput === "object" ? block.rawInput as Record<string, unknown> : {};
  const path = [input.path, input.file_path, input.target_file].find(value => typeof value === "string") as string | undefined;
  const command = typeof input.command === "string" ? input.command : undefined;
  const detail = family === "execute" ? command ?? path : path ?? [input.pattern, input.query, command].find(value => typeof value === "string") as string | undefined;
  return { family, path, detail };
}
export function groupWorkBlocks(blocks: Block[]) {
  const items: Array<{ kind: "block"; block: Block } | { kind: "explore" | "execute"; blocks: Tool[] }> = [];
  for (const block of blocks) {
    const family = block.kind === "tool-call" ? toolPresentation(block).family : null;
    if (block.kind === "tool-call" && (family === "explore" || family === "execute")) {
      const previous = items.at(-1);
      if (previous?.kind === family) previous.blocks.push(block); else items.push({ kind: family, blocks: [block] });
    } else items.push({ kind: "block", block });
  }
  return items;
}
export function workDuration(seconds: number, locale: string = "zh-CN"): string {
  const units = locale === "en" ? ["s", "m", "h"] : ["秒", "分", "时"];
  if (seconds < 60) return `${seconds} ${units[0]}`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes} ${units[1]}` : `${Math.floor(minutes / 60)} ${units[2]} ${minutes % 60} ${units[1]}`;
}
