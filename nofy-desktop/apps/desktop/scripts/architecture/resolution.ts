import { relative } from "node:path";
import ts from "typescript";
export function resolveReference(specifier: string, file: string, app: string, options: ts.CompilerOptions, host: ts.ModuleResolutionHost = ts.sys): { target: string; unresolved: boolean } {
  const resolved = ts.resolveModuleName(specifier, file, options, host).resolvedModule;
  const path = resolved ? relative(app, resolved.resolvedFileName) : null;
  const internal = path !== null && path !== ".." && !path.startsWith("../") && !path.startsWith("..\\");
  const alias = Object.keys(options.paths ?? {}).some(key => specifier.startsWith(key.replace(/\*.*$/, "")));
  return { target: internal ? path.split("\\").join("/") : specifier, unresolved: !resolved && (specifier.startsWith(".") || alias) };
}
