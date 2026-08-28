import { a as i } from "./chunk-LQDBAECE.js";
function quotePosixShellArg(r) {
  return `'${r.replaceAll("'", `'"'"'`)}'`;
}
i(quotePosixShellArg, "quotePosixShellArg");
function buildPosixShellExecCommand(r) {
  return `/bin/sh -c ${quotePosixShellArg(r)}`;
}
i(buildPosixShellExecCommand, "buildPosixShellExecCommand");
function quotePosixPathArg(r) {
  return r === "~"
    ? '"$HOME"'
    : r.startsWith("~/")
      ? `"$HOME"${quotePosixShellArg(r.slice(1))}`
      : quotePosixShellArg(r);
}
i(quotePosixPathArg, "quotePosixPathArg");
function resolvePosixHomePath(r, n) {
  return r === "~" ? n : r.startsWith("~/") ? `${n.replace(/\/$/, "")}/${r.slice(2)}` : r;
}
i(resolvePosixHomePath, "resolvePosixHomePath");
function buildWriteLiteralFileCommand(r, n) {
  return `printf %s ${quotePosixShellArg(n)} > ${quotePosixPathArg(r)}`;
}
i(buildWriteLiteralFileCommand, "buildWriteLiteralFileCommand");
export {
  quotePosixShellArg as a,
  buildPosixShellExecCommand as b,
  quotePosixPathArg as c,
  resolvePosixHomePath as d,
  buildWriteLiteralFileCommand as e,
};
