import { watch } from "node:fs";
import { open, realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, sep } from "node:path";
import type { RasterResult, WorkspaceChange, WorkspaceWatch } from "../../shared/workspace-files-contract.ts";
const inside = (root: string, path: string) => { const rel = relative(root,path); return !rel.startsWith(".." + sep) && rel !== ".." && !isAbsolute(rel); };
async function scoped(root: string, path: string) {
  if (typeof root !== "string" || typeof path !== "string" || !isAbsolute(root) || !isAbsolute(path) || root.includes("\0") || path.includes("\0") || path.length > 32768) throw new Error("Invalid workspace path");
  const base = await realpath(root), target = await realpath(path);
  if (!inside(base,target)) throw new Error("File is outside the workspace");
  return target;
}
/** Only inert raster bytes cross IPC; no local HTML/SVG or unrestricted file URL. */
export async function readRaster(root: string, path: string): Promise<RasterResult> {
  let handle;
  try {
    const target = await scoped(root,path);
    handle = await open(target, "r"); const metadata = await handle.stat();
    if (!metadata.isFile() || metadata.size > 8 * 1024 * 1024) throw new Error("Image must be a regular file no larger than 8 MiB");
    const bytes = Buffer.alloc(metadata.size + 1); const { bytesRead } = await handle.read(bytes,0,bytes.length,0); const data = bytes.subarray(0,bytesRead);
    if (bytesRead > 8 * 1024 * 1024 || bytesRead !== metadata.size) throw new Error("Image changed during read; refresh to retry");
    const png = data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const gif = /^GIF8[79]a$/.test(data.subarray(0,6).toString("ascii"));
    const jpeg = data[0] === 255 && data[1] === 216 && data[2] === 255;
    const webp = data.subarray(0,4).toString("ascii") === "RIFF" && data.subarray(8,12).toString("ascii") === "WEBP";
    if (!png && !gif && !jpeg && !webp) throw new Error("Unsupported image content");
    if (png && data.length >= 24 && data.readUInt32BE(16) * data.readUInt32BE(20) > 40_000_000) throw new Error("Image dimensions are too large");
    if (gif && data.length >= 10 && data.readUInt16LE(6) * data.readUInt16LE(8) > 40_000_000) throw new Error("Image dimensions are too large");
    const mime = png ? "png" : gif ? "gif" : jpeg ? "jpeg" : "webp";
    return { ok: true, dataUrl: "data:image/" + mime + ";base64," + data.toString("base64"), size: data.length };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : String(error) }; }
  finally { await handle?.close(); }
}
/** Non-recursive, bounded directory watchers. A workspace replacement closes the old subscription. */
export async function watchWorkspace(request: WorkspaceWatch, emit: (change: WorkspaceChange) => void) {
  if (!request || typeof request.id !== "string" || request.id.length > 512 || !Array.isArray(request.directories) || request.directories.length > 32) throw new Error("Invalid watch request");
  const root = await scoped(request.root,request.root);
  if (!(await stat(root)).isDirectory()) throw new Error("Workspace is not a directory");
  const watchers: ReturnType<typeof watch>[] = [];
  const paths = new Set<string>(); let timer: ReturnType<typeof setTimeout> | null = null, closed = false;
  const signal = (path: string) => {
    if (closed) return;
    if (paths.size < 64) paths.add(path); else { paths.clear(); paths.add(request.root); }
    if (timer) return;
    timer = setTimeout(() => { timer = null; const changed = [...paths]; paths.clear(); if (!closed) emit({ id: request.id, root: request.root, paths: changed }); },100);
  };
  for (const directory of [...new Set([request.root,...request.directories])].slice(0,32)) {
    try {
      const target = await scoped(request.root,directory); if (!(await stat(target)).isDirectory()) continue;
      const watcher = watch(target, (_event, filename) => { const child = filename ? filename.toString() : ""; signal(child && !child.includes(sep) ? join(directory,child) : directory); });
      watcher.on("error", () => signal(directory)); watchers.push(watcher);
    } catch { /* Removed/inaccessible expanded directories are refreshed through their parent. */ }
  }
  return () => { closed = true; if (timer) clearTimeout(timer); for (const watcher of watchers) watcher.close(); };
}
