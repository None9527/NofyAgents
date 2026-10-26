/** Local macOS package from the installed Electron runtime, following Electron's manual distribution layout. */
import { cp, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = resolve(appRoot, "..", "..");
const require = createRequire(import.meta.url);
const manifest = JSON.parse(await readFile(join(appRoot, "package.json"), "utf8")) as { version: string };
const product = "Nofy";
const bundleId = "dev.nofy.desktop";
const outputRoot = join(workspaceRoot, "release", `mac-${process.arch}`);
const application = join(outputRoot, `${product}.app`);
const artifact = join(outputRoot, `nofy-desktop-${manifest.version}-mac-${process.arch}.zip`);
function command(binary: string, args: string[]) {
  const result = spawnSync(binary, args, { cwd: appRoot, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${binary} failed (${result.status})`);
}
if (process.platform !== "darwin") throw new Error("Only a native macOS local package is implemented; Windows/Linux are not release validated.");
if (!process.argv.includes("--skip-build")) command("pnpm", ["build"]);
for (const entry of ["main/index.mjs", "preload/index.mjs", "renderer/index.html"]) await readFile(join(appRoot, "dist", entry));
await mkdir(outputRoot, { recursive: true });
await rm(application, { recursive: true, force: true });
const electron = join(dirname(require.resolve("electron/package.json")), "dist", "Electron.app");
await cp(electron, application, { recursive: true, verbatimSymlinks: true });
const contents = join(application, "Contents");
const resources = join(contents, "Resources");
await rm(join(resources, "default_app.asar"), { force: true });
const runtimeApp = join(resources, "app");
await mkdir(runtimeApp, { recursive: true });
await cp(join(appRoot, "dist"), join(runtimeApp, "dist"), { recursive: true, filter: path => !path.endsWith(".map") });
await writeFile(join(runtimeApp, "package.json"), JSON.stringify({ name: "nofy-desktop", productName: product, version: manifest.version, type: "module", main: "dist/main/index.mjs" }, null, 2) + "\n");
// The main/preload bundles externalize only electron and node built-ins; no source/node_modules/config is copied.
await rename(join(contents, "MacOS", "Electron"), join(contents, "MacOS", product));
const iconset = join(outputRoot, "nofy.iconset");
await mkdir(iconset, { recursive: true });
const icon = join(outputRoot, "nofy-icon.png");
command("/usr/bin/swift", [join(appRoot, "packaging", "icon.swift"), icon]);
for (const size of [16, 32, 128, 256, 512]) {
  command("/usr/bin/sips", ["-z", String(size), String(size), icon, "--out", join(iconset, `icon_${size}x${size}.png`)]);
  command("/usr/bin/sips", ["-z", String(size * 2), String(size * 2), icon, "--out", join(iconset, `icon_${size}x${size}@2x.png`)]);
}
command("/usr/bin/iconutil", ["-c", "icns", iconset, "-o", join(resources, "nofy.icns")]);
await rm(join(resources, "electron.icns"), { force: true });
const plist = join(contents, "Info.plist");
command("/usr/libexec/PlistBuddy", ["-c", "Set :CFBundleIconFile nofy.icns", plist]);
for (const [key, value] of Object.entries({ CFBundleDisplayName: product, CFBundleName: product, CFBundleExecutable: product, CFBundleIdentifier: bundleId, CFBundleShortVersionString: manifest.version, CFBundleVersion: manifest.version })) command("/usr/libexec/PlistBuddy", ["-c", `Set :${key} ${value}`, plist]);
// Remove integrity metadata for Electron's removed default_app.asar.
command("/usr/libexec/PlistBuddy", ["-c", "Delete :ElectronAsarIntegrity", plist]);
for (const name of await readdir(join(contents, "Frameworks"))) {
  if (!name.endsWith(".app")) continue;
  const helperPlist = join(contents, "Frameworks", name, "Contents", "Info.plist");
  const suffix = name.replace(/^Electron Helper/, "").replace(/\.app$/, "").trim();
  command("/usr/libexec/PlistBuddy", ["-c", `Set :CFBundleName ${product} Helper ${suffix}`, helperPlist]);
  command("/usr/libexec/PlistBuddy", ["-c", `Add :CFBundleDisplayName string ${product} Helper ${suffix}`, helperPlist]);
  command("/usr/libexec/PlistBuddy", ["-c", `Set :CFBundleIdentifier ${bundleId}.helper${suffix.replace(/[^a-zA-Z]/g, "").toLowerCase()}`, helperPlist]);
}
// Local ad-hoc signing repairs the modified bundle seal. No Developer ID, notarization or publication is performed.
command("/usr/bin/codesign", ["--force", "--deep", "--sign", "-", application]);
command("/usr/bin/codesign", ["--verify", "--deep", "--strict", application]);
await rm(artifact, { force: true });
command("/usr/bin/ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", application, artifact]);
const sha256 = createHash("sha256").update(await readFile(artifact)).digest("hex");
await writeFile(artifact + ".sha256", `${sha256}  ${artifact.slice(artifact.lastIndexOf("/") + 1)}\n`);
console.log(JSON.stringify({ application, artifact, sha256, platform: process.platform, architecture: process.arch, version: manifest.version, signing: "ad-hoc local only", kernelBundled: false }, null, 2));
