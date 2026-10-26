import { stat, writeFile } from "node:fs/promises";
import { basename, isAbsolute } from "node:path";
export async function validateDirectory(path: string): Promise<string> {
  if (!isAbsolute(path) || !(await stat(path)).isDirectory()) throw new Error("请选择可访问的文件夹");
  return path;
}
export function exportFileName(name: unknown): string {
  if (typeof name !== "string" || name.length === 0) return "conversation.md";
  return basename(name).replace(/[\u0000-\u001f]/g, "_");
}
export async function writeExport(path: string, content: unknown): Promise<void> {
  if (typeof content !== "string" || content.length > 10_000_000) throw new TypeError("导出文本过大或格式无效");
  await writeFile(path, content, { encoding: "utf8", mode: 0o600 });
}
