import { stat } from "node:fs/promises";
import { isAbsolute, basename } from "node:path";
import type { FileHostResult, FileOpenKind } from "../../shared/file-host-contract.ts";
export type FileHostProviders = {
  platform: string;
  copy: (text: string) => void;
  openDefault: (path: string) => Promise<string>;
  reveal: (path: string) => void;
  chooseApplication: () => Promise<string | null>;
  openApplication: (application: string, path: string) => Promise<void>;
};
function text(value: unknown): string {
  if (typeof value !== "string" || !value || value.length > 32768 || value.includes("\0")) throw new Error("路径格式无效");
  return value;
}
export async function copyFilePath(value: unknown, providers: Pick<FileHostProviders, "copy">): Promise<FileHostResult> {
  try { providers.copy(text(value)); return { ok: true }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : String(error) }; }
}
export async function openWorkspacePath(value: unknown, kind: unknown, providers: FileHostProviders): Promise<FileHostResult> {
  try {
    const path = text(value);
    if (!isAbsolute(path)) throw new Error("打开文件需要绝对路径");
    if (!["default", "choose", "reveal"].includes(kind as FileOpenKind)) throw new Error("不支持的打开方式");
    const target = await stat(path);
    if (!target.isFile() && !target.isDirectory()) throw new Error("该路径不是普通文件或文件夹");
    if (kind === "reveal") { providers.reveal(path); return { ok: true }; }
    if (kind === "default") { const error = await providers.openDefault(path); return error ? { ok: false, error } : { ok: true }; }
    if (providers.platform !== "darwin") return { ok: false, error: "当前平台尚未支持选择应用，请使用系统默认打开" };
    const application = await providers.chooseApplication();
    if (application === null) return { ok: true, canceled: true };
    if (!isAbsolute(application) || !application.endsWith(".app") || application.includes("\0") || !(await stat(application)).isDirectory()) throw new Error("请选择有效的 macOS 应用");
    await providers.openApplication(application, path);
    return { ok: true, application: basename(application, ".app") };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : String(error) }; }
}
