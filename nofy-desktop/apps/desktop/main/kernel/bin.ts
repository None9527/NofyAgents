/** Kernel is installed separately. Bundles contain no kernel, config, credentials or sessions. */
import { accessSync, constants, existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));

/** Explicit path, user install, then repository release build during development only. */
export function kernelBinCandidates(moduleDirectory = here): string[] {
  const repository = resolve(moduleDirectory, "..", "..", "..", "..", "..");
  return [
    process.env["NOFY_BIN"] ?? "",
    join(homedir(), ".local", "bin", process.platform === "win32" ? "nofy.exe" : "nofy"),
    ...(existsSync(join(repository, "Cargo.toml")) ? [join(repository, "target", "release", process.platform === "win32" ? "nofy.exe" : "nofy")] : []),
  ].filter(candidate => candidate.length > 0);
}

export function resolveKernelBin(candidates = kernelBinCandidates()): string {
  for (const candidate of candidates) {
    try {
      if (!statSync(candidate).isFile()) continue;
      accessSync(candidate, process.platform === "win32" ? constants.F_OK : constants.X_OK);
      return resolve(candidate);
    } catch { /* Continue to the next supported install location. */ }
  }
  throw new Error("nofy kernel binary not found or not executable. Looked in: " + candidates.join(" | ") + " — install nofy at ~/.local/bin/nofy or set NOFY_BIN to an executable absolute path.");
}
