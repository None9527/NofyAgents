import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copyFilePath, openWorkspacePath } from "../main/seam/file-host.ts";
import type { FileHostProviders } from "../main/seam/file-host.ts";
async function fixture(run: (path: string, app: string) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), "nofy-file-host-"));
  try { const path = join(root, "文件 with spaces.txt"), app = join(root, "Mock Editor.app"); await writeFile(path, "fixture"); await mkdir(app); await run(path, app); } finally { await rm(root, { recursive: true, force: true }); }
}
const providers = (changes: Partial<FileHostProviders> = {}): FileHostProviders => ({ platform: "darwin", copy: () => {}, openDefault: async () => "", reveal: () => {}, chooseApplication: async () => null, openApplication: async () => {}, ...changes });
test("clipboard copies literal paths without requiring the file to still exist", async () => {
  let copied = ""; assert.equal((await copyFilePath("dir/文件.txt", { copy: value => { copied = value; } })).ok, true); assert.equal(copied, "dir/文件.txt");
  assert.equal((await copyFilePath("bad\0path", { copy: () => assert.fail() })).ok, false);
});
test("default open and reveal invoke separate host providers with the actual file", async () => fixture(async path => {
  const calls: string[] = [];
  await openWorkspacePath(path, "default", providers({ openDefault: async value => { calls.push("open:" + value); return ""; } }));
  await openWorkspacePath(path, "reveal", providers({ reveal: value => { calls.push("reveal:" + value); } }));
  assert.deepEqual(calls, ["open:" + path, "reveal:" + path]);
}));
test("default application failure remains visible", async () => fixture(async path => {
  assert.deepEqual(await openWorkspacePath(path, "default", providers({ openDefault: async () => "no application" })), { ok: false, error: "no application" });
}));
test("application choice can cancel or open a validated bundle with a space/Unicode path", async () => fixture(async (path, app) => {
  assert.deepEqual(await openWorkspacePath(path, "choose", providers()), { ok: true, canceled: true });
  let chosen: string[] = [];
  assert.deepEqual(await openWorkspacePath(path, "choose", providers({ chooseApplication: async () => app, openApplication: async (application, file) => { chosen = [application, file]; } })), { ok: true, application: "Mock Editor" });
  assert.deepEqual(chosen, [app, path]);
}));
test("invalid methods, relative or nonexistent paths never launch applications", async () => {
  const p = providers({ openDefault: async () => { assert.fail(); } });
  for (const [path, kind] of [["relative", "default"], ["/missing-nofy-file", "default"], ["/tmp", "execute"]]) assert.equal((await openWorkspacePath(path, kind, p)).ok, false);
});
