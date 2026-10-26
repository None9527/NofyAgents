/** Launch the packaged executable twice with a hermetic NOFY_HOME and verify clean exit, screenshots, and kernel reap. */
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const app = process.argv[2] ?? join(root, "release", `mac-${process.arch}`, "Nofy.app");
if (process.platform !== "darwin") throw new Error("Package launch verification currently targets macOS only");
const executable = join(app, "Contents", "MacOS", "Nofy");
await stat(executable);
const home = await mkdtemp(join(tmpdir(), "nofy-package-home-"));
const workspace = await mkdtemp(join(tmpdir(), "nofy-package-workspace-"));
const profile = join(home, "electron-profile");
const results: unknown[] = [];
try {
  for (let launch = 1; launch <= 2; launch++) {
    const screenshot = join(root, "release", `mac-${process.arch}`, `launch-${launch}.png`);
    const child = spawn(executable, ["--user-data-dir=" + profile], { cwd: workspace, env: { ...process.env, NOFY_HOME: home, NOFY_ISOLATED_HOME: "0", NOFY_DEV_SERVER_URL: "", NOFY_WORKSPACE: workspace, NOFY_SCREENSHOT: screenshot, NOFY_SCREENSHOT_QUIT: "1", NOFY_SCREENSHOT_DELAY: "3500" }, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", data => { output += String(data); });
    child.stderr.on("data", data => { output += String(data); });
    const timeout = setTimeout(() => child.kill("SIGTERM"), 20_000);
    const status = await new Promise<{ code: number | null; signal: string | null }>((done, reject) => { child.once("error", reject); child.once("exit", (code, signal) => done({ code, signal })); });
    clearTimeout(timeout);
    const screenshotBytes = (await stat(screenshot)).size;
    const childMatch = /kernel child exited pid=(\d+)/.exec(output);
    const kernelPid = childMatch ? Number(childMatch[1]) : null;
    let kernelStillRunning = false;
    if (kernelPid !== null) { try { process.kill(kernelPid, 0); kernelStillRunning = true; } catch {} }
    const pass = status.code === 0 && screenshotBytes > 1000 && kernelPid !== null && !kernelStillRunning && !/failed to load|ERR_FILE_NOT_FOUND/.test(output);
    results.push({ launch, pass, exitCode: status.code, signal: status.signal, screenshot, screenshotBytes, kernelReaped: kernelPid !== null && !kernelStillRunning });
    if (!pass) throw new Error(`Packaged launch ${launch} failed verification (exit ${status.code}, screenshot ${screenshotBytes}, kernel reaped ${!kernelStillRunning})`);
  }
  const packageJson = JSON.parse(await readFile(join(app, "Contents", "Resources", "app", "package.json"), "utf8"));
  const evidence = { generatedAt: new Date().toISOString(), platform: process.platform, arch: process.arch, version: packageJson.version, app, results, kernelBundled: false, signing: "ad-hoc local only", scope: "Two local executable launches in isolated NOFY_HOME and Electron user-data-dir; no Gatekeeper/notarization, external installation, Windows/Linux or model conversation validation" };
  await writeFile(join(root, "docs", "contract", "package-macos-verification.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));
} finally { await rm(home, { recursive: true, force: true }); await rm(workspace, { recursive: true, force: true }); }
