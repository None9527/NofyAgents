import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, chmodSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { kernelBinCandidates, resolveKernelBin } from "../main/kernel/bin.ts";

test("binary discovery rejects directories and non-executable files and respects candidate priority", () => {
  const directory = mkdtempSync(join(tmpdir(), "nofy-bin-test-"));
  try {
    const invalid = join(directory, "not-executable");
    const valid = join(directory, "nofy");
    writeFileSync(invalid, "test", { mode: 0o600 });
    writeFileSync(valid, "#!/bin/sh\nexit 0\n", { mode: 0o700 });
    chmodSync(valid, 0o700);
    if (process.platform !== "win32") assert.equal(resolveKernelBin([directory, invalid, valid]), valid);
    assert.throws(() => resolveKernelBin([directory, join(directory, "missing")]), /not found or not executable/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
test("packaged Resources directory does not advertise repository target/release fallback", () => {
  const candidates = kernelBinCandidates("/Applications/Nofy.app/Contents/Resources/app/dist/main");
  assert.equal(candidates.some(candidate => candidate.includes("target/release")), false);
});
