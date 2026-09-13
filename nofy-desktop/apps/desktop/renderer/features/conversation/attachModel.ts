/**
 * attachModel —— 「+ 添加上下文」的纯模型（node 下可测）。
 *
 * ## 线路真相（为什么不读文件）
 *
 * 内核 promptCapabilities 实测 embeddedContext:true；prompt 解析器收三种块：
 * text / resource_link / resource（prompt_parser.rs:104-127）。
 * resource_link 且 **meta 为空**时，内核把 "@绝对路径" 推进消息文本，
 * 再经 collect_file_references → render_file_reference **自己读文件内容**进上下文，
 * 并附一段 <system-reminder> 的 Referenced resources 清单（:266-283）。
 * ⇒ 客户端只发 {type:"resource_link", uri:"file://<abs>", name}，不碰 fs 读路径。
 *
 * uri 拼法注意：extract_path_from_uri 是 strip_prefix("file://")（:259-264），
 * 所以绝对路径要写成 file:///abs/...（三斜杠），剥完正好是 /abs/...。
 *
 * 数据源 = _nofy/search/fuzzy（open/change/status 全实测，ecosystem-shapes.json）；
 * 匹配行 {name,type,path,score} 直接转成附加项。
 */
import type { FuzzyMatch } from "../../ui/readers.ts";

export type AttachItem = {
  path: string;
  name: string;
  kind: "file" | "directory" | "other";
};

export function matchToAttach(m: FuzzyMatch): AttachItem {
  return { path: m.path, name: m.name, kind: m.type };
}

/** 去重追加：同路径不重复挂（返回新数组，不改入参）。 */
export function dedupeAttach(items: AttachItem[], next: AttachItem): AttachItem[] {
  if (items.some((i) => i.path === next.path)) return items;
  return [...items, next];
}

/**
 * 展示路径：落在 cwd 下的剥成相对（芯片宽度有限），其余原样。
 * 纯字符串前缀运算，不碰 fs、不解析符号链接。
 */
export function attachDisplayPath(path: string, cwd: string | null): string {
  if (cwd === null || cwd.length === 0) return path;
  const base = cwd.endsWith("/") ? cwd : cwd + "/";
  if (path.startsWith(base)) {
    const rel = path.slice(base.length);
    if (rel.length > 0) return rel;
  }
  return path;
}

/** 发送时的 wire 块序：附加项在前、文本块在后（内核按序拼 context + query）。 */
export function attachBlocks(items: AttachItem[], text: string): Array<Record<string, unknown>> {
  const blocks: Array<Record<string, unknown>> = items.map((i) => ({
    type: "resource_link",
    uri: "file://" + i.path,
    name: i.name,
  }));
  blocks.push({ type: "text", text });
  return blocks;
}
