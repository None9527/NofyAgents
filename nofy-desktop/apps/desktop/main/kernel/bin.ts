/**
 * 内核二进制定位。
 *
 * 移植自 seam/kernel-supervisor.js 的 resolveNofyBin（行为等价），但强化一处：
 * **找不到时抛错，不返回一个不存在的路径**。
 * 旧路 D6 的教训——写死 /usr/bin/node 这个不存在的路径，把「未配置」变成了
 * spawn ENOENT，进而全会话面 EPIPE 闸死。
 */
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/** 候选序：显式 env → 用户安装位 → 本仓库 release 构建产物（开发期兜底）。 */
export function kernelBinCandidates(): string[] {
  return [
    process.env["NOFY_BIN"] ?? "",
    join(homedir(), ".local", "bin", "nofy"),
    // main/kernel/bin.ts → apps/desktop → apps → nofy-desktop → 仓库根 = 四级上
    resolve(here, "..", "..", "..", "..", "..", "target", "release", "nofy"),
  ].filter((c) => c.length > 0);
}

export function resolveKernelBin(): string {
  for (const c of kernelBinCandidates()) {
    if (existsSync(c)) return c;
  }
  throw new Error(
    "nofy kernel binary not found. Looked in: " +
      kernelBinCandidates().join(" | ") +
      " — set NOFY_BIN to an explicit path.",
  );
}

